import { ConfigPlugin, createRunOncePlugin, withPlugins } from "@expo/config-plugins";
import { withBuildProperties } from "expo-build-properties";
import { withIntercomIOS } from "./withIntercomIOS";
import { withIntercomAndroid } from "./withIntercomAndroid";

export interface IntercomPluginPropsIOS {
  /**
   * Optional string to set for the photo usage description in intercom
   * relative to project root
   */
  iosPhotoUsageDescription?: string;
  /**
   * Intercom api key
   */
  iosApiKey?: string;
  /**
   * Enable push notifications for iOS
   */
  isPushNotificationsEnabledIOS?: boolean;
}

export interface IntercomPluginPropsAndroid {
  /** Optionally adds support for https://developers.intercom.com/installing-intercom/docs/react-native-data-hosting-region-configuration */
  intercomEURegion?: boolean;
  /**
   * Intercom app id
   */
  androidApiKey?: string;
  /**
   * Enable push notifications for Android
   */
   isPushNotificationsEnabledAndroid?: boolean;
}

// TODO: Add in built in push support
export interface IntercomPluginProps extends IntercomPluginPropsIOS, IntercomPluginPropsAndroid {
  /**
   * The app id for your intercom app
   */
  appId: string;
}

/**
 * Apply intercom-react-native configuration for Expo SDK 42 projects.
 */
const withIntercom: ConfigPlugin<IntercomPluginProps> = (config, props) => {
  const { iosApiKey, androidApiKey } = props;

  // Add ios plugin
  if (iosApiKey) {
    config = withIntercomIOS(config, props);
  }

  // Add android plugin
  if (androidApiKey) {
    config = withIntercomAndroid(config, props);
  }

  config = withPlugins(config, [
    [
      withBuildProperties,
      {
        android: {
          compileSdkVersion: 31,
          targetSdkVersion: 31,
          buildToolsVersion: "31.0.0",
        },
        ios: {
          deploymentTarget: "13.0",
        },
      },
    ],
  ]);

  // Return the modified config.
  return config;
};

const pkg = {
  // Prevent this plugin from being run more than once.
  // This pattern enables users to safely migrate off of this
  // out-of-tree `@config-plugins/intercom-react-native` to a future
  // upstream plugin in `intercom-react-native`
  name: "@intercom/intercom-react-native",
  // Indicates that this plugin is dangerously linked to a module,
  // and might not work with the latest version of that module.
  version: "UNVERSIONED",
};

export default createRunOncePlugin(withIntercom, pkg.name, pkg.version);
