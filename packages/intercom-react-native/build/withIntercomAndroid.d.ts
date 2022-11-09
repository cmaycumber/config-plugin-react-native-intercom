import { ConfigPlugin } from "@expo/config-plugins";
import type { IntercomPluginProps } from "./withIntercom";
export declare const withIntercomAndroid: ConfigPlugin<IntercomPluginProps>;
export declare const withIntercomAndroidManifest: ConfigPlugin<{
    EURegion?: boolean;
    pushNotifications: boolean;
}>;
export declare const withIntercomAppBuildGradle: ConfigPlugin<{
    pushNotifications: boolean;
}>;
export declare const withIntercomMainApplication: ConfigPlugin<{
    apiKey: string;
    appId: string;
}>;
