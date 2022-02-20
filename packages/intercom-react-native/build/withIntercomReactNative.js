"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const withIntercomAndroidManifest_1 = require("./withIntercomAndroidManifest");
const withIntercomAppDelegate_1 = require("./withIntercomAppDelegate");
const withIntercomInfoPlist_1 = require("./withIntercomInfoPlist");
const withIntercomMainApplication_1 = require("./withIntercomMainApplication");
/**
 * Apply intercom-react-native configuration for Expo SDK 42 projects.
 */
const withIntercomReactNative = (config, { appId, iosApiKey, androidApiKey, iosPhotoUsageDescription }) => {
    let localConfig = config;
    // Add ios specific plugins
    if (iosApiKey) {
        localConfig = (0, config_plugins_1.withPlugins)(localConfig, [
            [withIntercomAppDelegate_1.withIntercomAppDelegate, { apiKey: iosApiKey, appId }],
            [withIntercomInfoPlist_1.withIntercomInfoPlist, { iosPhotoUsageDescription }],
        ]);
    }
    // add android specific plugins
    if (androidApiKey) {
        localConfig = (0, config_plugins_1.withPlugins)(localConfig, [
            [withIntercomAndroidManifest_1.withIntercomAndroidManifest, {}],
            [withIntercomMainApplication_1.withIntercomMainApplication, { apiKey: androidApiKey, appId }],
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
exports.default = (0, config_plugins_1.createRunOncePlugin)(withIntercomReactNative, pkg.name, pkg.version);
