"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withIntercomAndroidManifest = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const { addMetaDataItemToMainApplication, getMainApplicationOrThrow } = config_plugins_1.AndroidConfig.Manifest;
const withIntercomAndroidManifest = (config, { EURegion }) => {
    config = config_plugins_1.AndroidConfig.Permissions.withPermissions(config, [
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.VIBRATE",
    ]);
    return (0, config_plugins_1.withAndroidManifest)(config, async (config) => {
        if (EURegion) {
            config.modResults = await setEURegionTrueAsync(config, config.modResults);
        }
        return config;
    });
};
exports.withIntercomAndroidManifest = withIntercomAndroidManifest;
// Splitting this function out of the mod makes it easier to test.
async function setEURegionTrueAsync(config, androidManifest) {
    // Get the <application /> tag and assert if it doesn't exist.
    const mainApplication = getMainApplicationOrThrow(androidManifest);
    addMetaDataItemToMainApplication(mainApplication, 
    // value for `android:name`
    "io.intercom.android.sdk.use.eu.server", 
    // value for `android:value`
    "true");
    return androidManifest;
}
