"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withIntercomAndroidManifest = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const withIntercomAndroidManifest = (config) => {
    config = config_plugins_1.AndroidConfig.Permissions.withPermissions(config, [
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.VIBRATE"
    ]);
    // config = AndroidConfig.Manifest.get
    return (0, config_plugins_1.withAndroidManifest)(config, async (config) => {
        return config;
    });
};
exports.withIntercomAndroidManifest = withIntercomAndroidManifest;
