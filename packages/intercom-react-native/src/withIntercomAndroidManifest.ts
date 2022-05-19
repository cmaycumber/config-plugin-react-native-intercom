import { ExpoConfig } from "@expo/config-types";
import { ConfigPlugin, withAndroidManifest, AndroidConfig } from "@expo/config-plugins";

const { addMetaDataItemToMainApplication, getMainApplicationOrThrow } = AndroidConfig.Manifest;

export const withIntercomAndroidManifest: ConfigPlugin<{
  EURegion: boolean;
}> = (config, { EURegion }) => {
  config = AndroidConfig.Permissions.withPermissions(config, [
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.VIBRATE",
  ]);

  // AndroidConfig.IntentFilters.withAndroidIntentFilters(config, {

  // })

  return withAndroidManifest(config, async (config) => {
    if (EURegion) {
      config.modResults = await setEURegionTrueAsync(config, config.modResults);
    }
    return config;
  });
};

async function addPushSupport() {}

// Splitting this function out of the mod makes it easier to test.
async function setEURegionTrueAsync(
  config: Pick<ExpoConfig, "android">,
  androidManifest: AndroidConfig.Manifest.AndroidManifest
): Promise<AndroidConfig.Manifest.AndroidManifest> {
  // Get the <application /> tag and assert if it doesn't exist.
  const mainApplication = getMainApplicationOrThrow(androidManifest);

  addMetaDataItemToMainApplication(
    mainApplication,
    // value for `android:name`
    "io.intercom.android.sdk.use.eu.server",
    // value for `android:value`
    "true"
  );

  return androidManifest;
}
