"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const withIntercomAndroidManifest_1 = require("./withIntercomAndroidManifest");
const withIntercomAppDelegate_1 = require("./withIntercomAppDelegate");
const withIntercomInfoPlist_1 = require("./withIntercomInfoPlist");
const withIntercomMainApplication_1 = require("./withIntercomMainApplication");
const withIntercomPodfile_1 = require("./withIntercomPodfile");
const withIntercomAppBuildGradle_1 = require("./withIntercomAppBuildGradle");
const withIntercomProjectBuildGradle_1 = require("./withIntercomProjectBuildGradle");
/**
 * Apply intercom-react-native configuration for Expo SDK 42 projects.
 */
const withIntercomReactNative = (config, { appId, iosApiKey, androidApiKey, iosPhotoUsageDescription, experimentalBumpMinIosPlatformVersion }) => {
    let localConfig = config;
    // Add ios specific plugins
    if (iosApiKey) {
        localConfig = config_plugins_1.withPlugins(localConfig, [
            [withIntercomAppDelegate_1.withIntercomAppDelegate, { apiKey: iosApiKey, appId }],
            [withIntercomInfoPlist_1.withIntercomInfoPlist, { iosPhotoUsageDescription }],
            [withIntercomPodfile_1.withIntercomPodfile, { deploymentTarget: '13.0' }],
        ]);
    }
    // add android specific plugins
    if (androidApiKey) {
        localConfig = config_plugins_1.withPlugins(localConfig, [
            [withIntercomAndroidManifest_1.withIntercomAndroidManifest, {}],
            [withIntercomMainApplication_1.withIntercomMainApplication, { apiKey: androidApiKey, appId }],
            [withIntercomAppBuildGradle_1.withIntercomAppBuildGradle, {}],
            [withIntercomProjectBuildGradle_1.withIntercomProjectBuildGradle, {}]
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
    name: "@intercom/intercom-react-native",
    // Indicates that this plugin is dangerously linked to a module,
    // and might not work with the latest version of that module.
    version: "UNVERSIONED",
};
exports.default = config_plugins_1.createRunOncePlugin(withIntercomReactNative, pkg.name, pkg.version);
