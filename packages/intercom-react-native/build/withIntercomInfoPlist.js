"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withIntercomInfoPlist = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const withIntercomInfoPlist = (config, { iosPhotoUsageDescription }) => {
    return (0, config_plugins_1.withInfoPlist)(config, async (config) => {
        // Add on the right permissions for expo to use the photo library, this might change if we add more permissions
        if (!config.modResults.NSPhotoLibraryUsageDescription) {
            config.modResults.NSPhotoLibraryUsageDescription =
                iosPhotoUsageDescription !== null && iosPhotoUsageDescription !== void 0 ? iosPhotoUsageDescription : "Upload images to support center";
        }
        return config;
    });
};
exports.withIntercomInfoPlist = withIntercomInfoPlist;
