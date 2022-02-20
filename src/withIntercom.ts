import {
  ConfigPlugin,
  withPlugins,
  withDangerousMod,
  IOSConfig,
  AndroidConfig,
  withInfoPlist,
  withProjectBuildGradle,
  withMainApplication,
  withAndroidManifest,
} from "@expo/config-plugins";
// Fixes support for node 12
import { promises as fs } from 'fs';

const checkProjectBuildGradle = ({ contents }: { contents: string }) => {
  const minSdkVersion = parseInt(
    contents.match(/minSdkVersion\s*=\s*(.*)/)?.[1] ?? "-1",
    10
  );

  // Check for the min sdk version
  if (minSdkVersion < 21) {
    throw new Error(
      `minSdkVersion needs to be at least 21, current version: ${minSdkVersion}`
    );
  }

  // Extract the version code and convert it to a number from classpath("com.android.tools.build:gradle:4.0.1")
  const gradleToolVersionCode = parseFloat(
    contents.match(
      /classpath\("com\.android\.tools\.build:gradle:(.*)"\)/
    )?.[1] ?? "-1"
  );

  if (gradleToolVersionCode < 4) {
    throw new Error(
      `com.android.tools.build:gradle  version needs to be at least 4.0, current version: ${gradleToolVersionCode}`
    );
  }
};

const withIntercomProjectBuildGradle: ConfigPlugin = (config) => {
  return withProjectBuildGradle(config, async (config) => {
    // config = { modResults, modRequest, ...expoConfig }

    // Modify the project build.gradle
    checkProjectBuildGradle({
      contents: config.modResults.contents,
    });

    return config;
  });
};

const modifyMainApplication = ({
  contents,
  apiKey,
  appId,
  packageName,
}: {
  contents: string;
  apiKey: string;
  appId: string;
  packageName: string | null;
}) => {
  if (!packageName) {
    throw new Error("Android package not found");
  }

  const importLine = `import com.intercom.reactnative.IntercomModule;`;
  if (!contents.includes(importLine)) {
    const packageImport = `package ${packageName};`;
    // Add the import line to the top of the file
    // Replace the first line with the intercom import
    contents = contents.replace(
      `${packageImport}`,
      `${packageImport}\n${importLine}`
    );
  }

  const initLine = `IntercomModule.initialize(this, "${apiKey}", "${appId}");`;

  if (!contents.includes(initLine)) {
    // TODO: Replace this with safer regex
    const soLoaderLine = `SoLoader.init(this, /* native exopackage */ false);`;
    // Replace the line SoLoader.init(this, /* native exopackage */ false); with regex
    contents = contents.replace(
      `${soLoaderLine}`,
      `${soLoaderLine}\n\t\t${initLine}\n`
    );
  }

  return contents;
};

const withIntercomMainApplication: ConfigPlugin<{
  apiKey: string;
  appId: string;
}> = (config, { apiKey, appId }) => {
  return withMainApplication(config, async (config) => {
    // Modify the project build.gradle
    config.modResults.contents = modifyMainApplication({
      contents: config.modResults.contents,
      apiKey,
      appId,
      packageName: AndroidConfig.Package.getPackage(config),
    });

    return config;
  });
};

const withIntercomAndroidManifest: ConfigPlugin = (config) => {
  return withAndroidManifest(config, async (config) => {
    // Check to see if android already contains the read external storage permissions
    const readExternalStoragePermission =
      "android.permission.READ_EXTERNAL_STORAGE";
    if (
      !AndroidConfig.Permissions.getPermissions(config.modResults).includes(
        readExternalStoragePermission
      )
    ) {
      AndroidConfig.Permissions.addPermission(
        config.modResults,
        readExternalStoragePermission
      );
    }

    return config;
  });
};

const initMethodInvocationBlock = `[IntercomModule initialize:`;

export function modifyObjcAppDelegate({
  contents,
  apiKey,
  appId,
}: {
  contents: string;
  apiKey: string;
  appId: string;
}): string {
  // Add import
  if (!contents.includes("#import <IntercomModule.h>")) {
    // Replace the first line with the intercom import
    contents = contents.replace(
      /#import "AppDelegate.h"/g,
      `#import "AppDelegate.h"\n#import <IntercomModule.h>`
    );
  }

  // Add invocation
  if (!contents.includes(initMethodInvocationBlock)) {
    // TODO: Determine if this is safe
    contents = contents.replace(
      /return YES;/g,
      `${initMethodInvocationBlock}@"${apiKey}" withAppId:@"${appId}"];\n\n\treturn YES;`
    );
  }

  return contents;
}

export const withIntercomAppDelegate: ConfigPlugin<{
  apiKey: string;
  appId: string;
}> = (config, { apiKey, appId }) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const fileInfo = IOSConfig.Paths.getAppDelegate(
        config.modRequest.projectRoot
      );
      let contents = await fs.readFile(fileInfo.path, "utf-8");
      if (fileInfo.language === "objc") {
        contents = modifyObjcAppDelegate({ contents, apiKey, appId });
      } else {
        throw new Error(
          `Cannot add Intercom code to AppDelegate of language "${fileInfo.language}"`
        );
      }
      await fs.writeFile(fileInfo.path, contents);
      return config;
    },
  ]);
};

export const withIntercomInfoPlist: ConfigPlugin<{
  iosPhotoUsageDescription: string;
}> = (config, { iosPhotoUsageDescription }) => {
  return withInfoPlist(config, async (config) => {
    // Add on the right permissions for expo to use the photo library, this might change if we add more permissions

    // @ts-ignore
    if (!config.modResults.NSPhotoLibraryUsageDescription) {
      // @ts-ignore
      config.modResults.NSPhotoLibraryUsageDescription =
        iosPhotoUsageDescription ?? "Upload images to support center";
    }

    return config;
  });
};

interface PluginProps {
  /**
   * Intercom api key
   */
  iosApiKey?: string;
  /**
   * Intercom app id
   */
  androidApiKey?: string;
  /**
   * The app id
   */
  appId: string;
  /**
   * Optional string to set for the photo usage description in intercom
   * relative to project root
   */
  iosPhotoUsageDescription?: string;
}

/**
 * A config plugin for configuring `react-native-firebase`
 */
const withIntercom: ConfigPlugin<PluginProps> = (
  config,
  { appId, iosApiKey, androidApiKey, iosPhotoUsageDescription }
) => {
  let localConfig = config;

  // Add ios specific plugins
  if (iosApiKey) {
    localConfig = withPlugins(localConfig, [
      [withIntercomAppDelegate, { apiKey: iosApiKey, appId }],
      [withIntercomInfoPlist, { iosPhotoUsageDescription }],
    ]);
  }

  // add android specific plugins
  if (androidApiKey) {
    localConfig = withPlugins(localConfig, [
      [withIntercomAndroidManifest, {}],
      [withIntercomMainApplication, { apiKey: androidApiKey, appId }],
      [withIntercomProjectBuildGradle, {}],
    ]);
  }

  return localConfig;
};

export default withIntercom;
