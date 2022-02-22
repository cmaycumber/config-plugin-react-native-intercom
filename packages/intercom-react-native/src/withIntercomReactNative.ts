import { ConfigPlugin, createRunOncePlugin, withPlugins } from "@expo/config-plugins";
import { withIntercomAndroidManifest } from "./withIntercomAndroidManifest";
import { withIntercomAppDelegate } from "./withIntercomAppDelegate";
import { withIntercomInfoPlist } from "./withIntercomInfoPlist";
import { withIntercomMainApplication } from "./withIntercomMainApplication";
import { withIntercomPodfile } from './withIntercomPodfile'
import { withIntercomAppBuildGradle } from './withIntercomAppBuildGradle'

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
  /** Bumps the min platform version in iOS to 13 */
  experimentalBumpMinIosPlatformVersion?: boolean;
}

/**
 * Apply intercom-react-native configuration for Expo SDK 42 projects.
 */
const withIntercomReactNative: ConfigPlugin<PluginProps> = (config, { appId, iosApiKey, androidApiKey, iosPhotoUsageDescription, experimentalBumpMinIosPlatformVersion }) => {


  let localConfig = config;

  // Add ios specific plugins
  if (iosApiKey) {
    localConfig = withPlugins(localConfig, [
      [withIntercomAppDelegate, { apiKey: iosApiKey, appId }],
      [withIntercomInfoPlist, { iosPhotoUsageDescription }],
      [withIntercomPodfile, { experimentalBumpMinIosPlatformVersion }]
    ]);
  }

  // add android specific plugins
  if (androidApiKey) {
    localConfig = withPlugins(localConfig, [
      [withIntercomAndroidManifest, {}],
      [withIntercomMainApplication, { apiKey: androidApiKey, appId }],
      [withIntercomAppBuildGradle, {}]
    ]);
  }

  // Return the modified config.
  return config;
};

const pkg = {
  // Prevent this plugin from being run more than once.
  // This pattern enables users to safely migrate off of this
  // out-of-tree `@config-plugins/intercom-react-native` to a future
  // upstream plugin in `intercom-react-native`
  name: "intercom-react-native",
  // Indicates that this plugin is dangerously linked to a module,
  // and might not work with the latest version of that module.
  version: "UNVERSIONED",
};

export default createRunOncePlugin(withIntercomReactNative, pkg.name, pkg.version);
