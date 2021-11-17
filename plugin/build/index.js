"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const ios_1 = require("./ios");
/**
 * A config plugin for configuring `react-native-firebase`
 */
const withRnIntercom = (config, { apiKey, iosPhotoUsageDescription } = {
    apiKey: "",
}) => {
    return config_plugins_1.withPlugins(config, [
        [ios_1.withIntercomAppDelegate, { apiKey }],
        [ios_1.withIntercomInfoPlist, { iosPhotoUsageDescription }],
    ]);
};
exports.default = withRnIntercom;
