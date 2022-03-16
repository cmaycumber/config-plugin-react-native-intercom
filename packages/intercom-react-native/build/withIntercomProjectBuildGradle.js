"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withIntercomProjectBuildGradle = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const withIntercomProjectBuildGradle = (config) => {
    return config_plugins_1.withProjectBuildGradle(config, async (config) => {
        config.modResults.contents = config_plugins_1.AndroidConfig.Version.setMinBuildScriptExtVersion(config.modResults.contents, {
            name: 'compileSdkVersion',
            minVersion: 31
        });
        return config;
    });
};
exports.withIntercomProjectBuildGradle = withIntercomProjectBuildGradle;
