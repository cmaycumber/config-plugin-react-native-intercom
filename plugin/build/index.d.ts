import { ConfigPlugin } from "@expo/config-plugins";
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
declare const withRnIntercom: ConfigPlugin<PluginProps>;
export default withRnIntercom;
