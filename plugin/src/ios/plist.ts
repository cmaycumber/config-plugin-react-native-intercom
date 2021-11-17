import { ConfigPlugin, withExpoPlist } from "@expo/config-plugins";

export const withIntercomInfoPlist: ConfigPlugin<{
  iosPhotoUsageDescription: string;
}> = (config, { iosPhotoUsageDescription }) => {
  return withExpoPlist(config, async (config) => {
    // Add on the right permissions for expo to use the photo library, this might change if we add more permissions

    // @ts-ignore
    if (!config.modResults.NSPhotoLibraryUsageDescription) {
      // @ts-ignore
      config.modResults.NSPhotoLibraryUsageDescription =
        iosPhotoUsageDescription ?? "Upload images to support center";
    }

    return config;
  });
};
