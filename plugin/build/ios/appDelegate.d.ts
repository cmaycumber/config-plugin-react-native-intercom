import { ConfigPlugin } from "@expo/config-plugins";
export declare function modifyObjcAppDelegate(contents: string): string;
export declare const withIntercomAppDelegate: ConfigPlugin<{
    apiKey: string;
}>;
