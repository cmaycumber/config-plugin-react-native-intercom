import { ConfigPlugin, withInfoPlist } from "@expo/config-plugins";

export const withIntercomInfoPlist: ConfigPlugin<{
    iosPhotoUsageDescription: string;
}> = (config, { iosPhotoUsageDescription }) => {
    return withInfoPlist(config, async (config) => {
        // Add on the right permissions for expo to use the photo library, this might change if we add more permissions
        if (!config.modResults.NSPhotoLibraryUsageDescription) {
            config.modResults.NSPhotoLibraryUsageDescription =
                iosPhotoUsageDescription ?? "Upload images to support center";
        }
        return config;
    });
};
