"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withIntercomAppBuildGradle = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
const withIntercomAppBuildGradle = (config) => {
    return (0, config_plugins_1.withAppBuildGradle)(config, async (config) => {
        config.modResults.contents = addAndroidPackagingOptions(config.modResults.contents).contents;
        return config;
    });
};
exports.withIntercomAppBuildGradle = withIntercomAppBuildGradle;
const addAndroidPackagingOptions = (src) => {
    return (0, generateCode_1.mergeContents)({
        tag: "okhttp-urlconnection",
        src,
        newSrc: `
        com.squareup.okhttp3:okhttp-urlconnection:4.9.1'
      `,
        anchor: /dependencies(?:\s+)?\{/,
        // Inside the dependencies block.
        offset: 1,
        comment: "//",
    });
};
