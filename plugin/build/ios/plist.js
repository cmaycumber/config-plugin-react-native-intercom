"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withIntercomInfoPlist = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const withIntercomInfoPlist = (config, { iosPhotoUsageDescription }) => {
    return config_plugins_1.withExpoPlist(config, async (config) => {
        // Add on the right permissions for expo to use the photo library, this might change if we add more permissions
        // @ts-ignore
        if (!config.modResults.NSPhotoLibraryUsageDescription) {
            // @ts-ignore
            config.modResults.NSPhotoLibraryUsageDescription =
                iosPhotoUsageDescription !== null && iosPhotoUsageDescription !== void 0 ? iosPhotoUsageDescription : "Upload images to support center";
        }
        return config;
    });
};
exports.withIntercomInfoPlist = withIntercomInfoPlist;
