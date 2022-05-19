import { AndroidConfig, ConfigPlugin, withMainApplication } from "@expo/config-plugins";

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
