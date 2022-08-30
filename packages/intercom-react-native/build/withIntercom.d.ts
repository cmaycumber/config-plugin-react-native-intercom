import { ConfigPlugin } from "@expo/config-plugins";
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
    /**
     * Customize the icon for intercom push notifications from the intercom default
     */
    androidIcon?: string;
}
export interface IntercomPluginProps extends IntercomPluginPropsIOS, IntercomPluginPropsAndroid {
    /**
     * The app id for your intercom app
     */
    appId: string;
}
declare const _default: ConfigPlugin<IntercomPluginProps>;
export default _default;
