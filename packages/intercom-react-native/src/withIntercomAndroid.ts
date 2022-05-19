import { ExpoConfig } from "@expo/config-types";
import {
  ConfigPlugin,
  withAndroidManifest,
  AndroidConfig,
  withAppBuildGradle,
  withMainApplication,
  withDangerousMod,
  WarningAggregator,
  withProjectBuildGradle,
} from "@expo/config-plugins";
import type { IntercomPluginProps } from "./withIntercom";
import { mergeContents } from "@expo/config-plugins/build/utils/generateCode";
import path from "path";
import { promises as fs } from "fs";

const { addMetaDataItemToMainApplication, getMainApplicationOrThrow } = AndroidConfig.Manifest;

function getPackageRoot(projectRoot: string) {
  return path.join(projectRoot, "android", "app", "src", "main", "java");
}

function getCurrentPackageName(projectRoot: string, packageRoot: string) {
  const mainApplication = AndroidConfig.Paths.getProjectFilePath(projectRoot, "MainApplication");
  const packagePath = path.dirname(mainApplication);
  const packagePathParts = path.relative(packageRoot, packagePath).split(path.sep).filter(Boolean);

  return packagePathParts.join(".");
}

async function readFileAsync(path: string) {
  return fs.readFile(path, "utf8");
}

async function saveFileAsync(path: string, content: string) {
  return fs.writeFile(path, content, "utf8");
}

function getMainNotificationService(packageName: string) {
  return `package ${packageName};
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.intercom.reactnative.IntercomModule;

public class MainNotificationService extends FirebaseMessagingService {

  @Override public void onNewToken(String refreshedToken) {
    IntercomModule.sendTokenToIntercom(getApplication(), refreshedToken);
    super.onNewToken(refreshedToken);
  }

  public void onMessageReceived(RemoteMessage remoteMessage) {
    if (IntercomModule.isIntercomPush(remoteMessage)) {
      IntercomModule.handleRemotePushMessage(getApplication(), remoteMessage);
    } else {
      super.onMessageReceived(remoteMessage);
    }
  }
}`;
}

export const withIntercomAndroid: ConfigPlugin<IntercomPluginProps> = (
  config,
  { intercomEURegion, androidApiKey, appId, isPushNotificationsEnabled = false }
) => {
  config = withIntercomAndroidManifest(config, {
    EURegion: intercomEURegion,
    pushNotifications: isPushNotificationsEnabled,
  });
  config = withIntercomAppBuildGradle(config, {
    pushNotifications: isPushNotificationsEnabled,
  });
  config = withIntercomMainApplication(config, {
    appId,
    apiKey: androidApiKey as string,
  });

  if (isPushNotificationsEnabled) {
    config = withIntercomMainNotificationService(config, {});
    config = withIntercomProjectBuildGradle(config, {});
  }
  return config;
};

export const withIntercomAndroidManifest: ConfigPlugin<{
  EURegion?: boolean;
  pushNotifications: boolean;
}> = (config, { EURegion, pushNotifications }) => {
  config = AndroidConfig.Permissions.withPermissions(config, [
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.VIBRATE",
  ]);

  return withAndroidManifest(config, async (config) => {
    if (EURegion) {
      config.modResults = await setEURegionTrueAsync(config, config.modResults);
    }

    if (pushNotifications) {
      config.modResults.manifest.$ = config.modResults.manifest.$ = {
        ...config.modResults.manifest.$,
        "xmlns:tools": "http://schemas.android.com/tools",
      };

      if (config.modResults.manifest.application?.[0]) {
        config.modResults.manifest.application[0].service = [
          ...(config.modResults.manifest.application[0].service ?? []),
          {
            $: {
              "android:name": ".MainNotificationService",
              "android:exported": "false",
            },
            "intent-filter": [
              {
                $: {},
                action: [
                  {
                    $: {
                      "android:name": "com.google.firebase.MESSAGING_EVENT",
                    },
                  },
                ],
              },
            ],
          },
        ];
        config.modResults.manifest.application[0].receiver = [
          ...(config.modResults.manifest.application[0].receiver ?? []),
          {
            $: {
              "android:name": "com.intercom.reactnative.RNIntercomPushBroadcastReceiver",
              // @ts-ignore
              "tools:replace": "android:exported",
              "android:exported": "true",
            },
          },
        ];
      }
    }

    return config;
  });
};

const withIntercomProjectBuildGradle: ConfigPlugin<{}> = (config) => {
  return withProjectBuildGradle(config, async (config) => {
    const googleClasspath = `classpath 'com.google.gms:google-services:4.3.10'`;
    if (!config.modResults.contents.includes(googleClasspath)) {
      const anchor = `dependencies {`;
      config.modResults.contents = config.modResults.contents.replace(
        `${anchor}`,
        `${anchor}\n\t\t${googleClasspath}`
      );
    }

    return config;
  });
};

export const withIntercomAppBuildGradle: ConfigPlugin<{ pushNotifications: boolean }> = (
  config,
  { pushNotifications }
) => {
  return withAppBuildGradle(config, async (config) => {
    config.modResults.contents = mergeContents({
      tag: "okhttp-urlconnection",
      src: config.modResults.contents,
      newSrc: "    implementation 'com.squareup.okhttp3:okhttp-urlconnection:4.9.1'",
      anchor: /dependencies\s*\{/,
      offset: 1,
      comment: "//",
    }).contents;
    if (pushNotifications) {
      const firebaseImp = `implementation 'com.google.firebase:firebase-messaging:20.2.+'`;
      if (!config.modResults.contents.includes(firebaseImp)) {
        const anchor = `implementation "com.facebook.react:react-native:+"  // From node_modules`;
        config.modResults.contents = config.modResults.contents.replace(
          anchor,
          `${anchor}
      ${firebaseImp}`
        );
      }

      const applyPlugin = `apply plugin: 'com.google.gms.google-services'`;
      if (!config.modResults.contents.includes(applyPlugin)) {
        const anchor = `apply from: new File(["node", "--print", "require.resolve('@react-native-community/cli-platform-android/package.json')"].execute(null, rootDir).text.trim(), "../native_modules.gradle");`;
        config.modResults.contents = config.modResults.contents.replace(
          anchor,
          `${applyPlugin}\n\n${anchor}`
        );
      }
    }

    return config;
  });
};

export const withIntercomMainApplication: ConfigPlugin<{
  apiKey: string;
  appId: string;
}> = (config, { apiKey, appId }) => {
  return withMainApplication(config, async (config) => {
    // AndroidConfig.Manifest.add
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

const withIntercomMainNotificationService: ConfigPlugin<{}> = (config) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      await createMainNotificationService(config.modRequest.projectRoot);
      return config;
    },
  ]);
};

const createMainNotificationService = async (projectRoot: string) => {
  const packageRoot = getPackageRoot(projectRoot);
  const packageName = getCurrentPackageName(projectRoot, packageRoot);
  const filePath = path.join(
    packageRoot,
    `${packageName.split(".").join("/")}/MainNotificationService.java`
  );

  try {
    return await saveFileAsync(filePath, getMainNotificationService(packageName));
  } catch (e) {
    WarningAggregator.addWarningAndroid(
      "config-plugin-react-native-intercom",
      `Couldn't create MainNotificationService.java - ${e}.`
    );
  }
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
    contents = contents.replace(`${packageImport}`, `${packageImport}\n${importLine}`);
  }

  const initLine = `IntercomModule.initialize(this, "${apiKey}", "${appId}");`;

  if (!contents.includes(initLine)) {
    const soLoaderLine = `SoLoader.init(this, /* native exopackage */ false);`;
    // Replace the line SoLoader.init(this, /* native exopackage */ false); with regex
    contents = contents.replace(`${soLoaderLine}`, `${soLoaderLine}\n\t\t${initLine}\n`);
  }

  return contents;
};

// Splitting this function out of the mod makes it easier to test.
async function setEURegionTrueAsync(
  config: Pick<ExpoConfig, "android">,
  androidManifest: AndroidConfig.Manifest.AndroidManifest
): Promise<AndroidConfig.Manifest.AndroidManifest> {
  // Get the <application /> tag and assert if it doesn't exist.
  const mainApplication = getMainApplicationOrThrow(androidManifest);

  addMetaDataItemToMainApplication(
    mainApplication,
    // value for `android:name`
    "io.intercom.android.sdk.use.eu.server",
    // value for `android:value`
    "true"
  );

  return androidManifest;
}
