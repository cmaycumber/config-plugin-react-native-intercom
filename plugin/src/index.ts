import { ConfigPlugin, withPlugins } from "@expo/config-plugins";

import { withIntercomInfoPlist, withIntercomAppDelegate } from "./ios";

interface PluginProps {
  /**
   * Intercom api string
   */
  apiKey: string;
  /**
   * Optional string to set for the photo usage description in intercom
   * relative to project root
   */
  iosPhotoUsageDescription?: string;
}

/**
 * A config plugin for configuring `react-native-firebase`
 */
const withRnIntercom: ConfigPlugin<PluginProps> = (
  config,
  { apiKey, iosPhotoUsageDescription } = {
    apiKey: "",
  }
) => {
  return withPlugins(config, [
    [withIntercomAppDelegate, { apiKey }],
    [withIntercomInfoPlist, { iosPhotoUsageDescription }],
  ]);
};

export default withRnIntercom;
