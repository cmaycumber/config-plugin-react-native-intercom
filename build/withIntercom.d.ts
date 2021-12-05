import { ConfigPlugin } from "@expo/config-plugins";
export declare function modifyObjcAppDelegate({ contents, apiKey, appId, }: {
    contents: string;
    apiKey: string;
    appId: string;
}): string;
export declare const withIntercomAppDelegate: ConfigPlugin<{
    apiKey: string;
    appId: string;
}>;
export declare const withIntercomInfoPlist: ConfigPlugin<{
    iosPhotoUsageDescription: string;
}>;
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
declare const withIntercom: ConfigPlugin<PluginProps>;
export default withIntercom;
