"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withIntercomMainApplication = exports.withIntercomAppBuildGradle = exports.withIntercomAndroidManifest = exports.withIntercomAndroid = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
const image_utils_1 = require("@expo/image-utils");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const DPI_VALUES = {
    mdpi: { folderName: "drawable-mdpi", scale: 1 },
    hdpi: { folderName: "drawable-hdpi", scale: 1.5 },
    xhdpi: { folderName: "drawable-xhdpi", scale: 2 },
    xxhdpi: { folderName: "drawable-xxhdpi", scale: 3 },
    xxxhdpi: { folderName: "drawable-xxxhdpi", scale: 4 },
};
const BASELINE_PIXEL_SIZE = 24;
const { addMetaDataItemToMainApplication, getMainApplicationOrThrow } = config_plugins_1.AndroidConfig.Manifest;
function getPackageRoot(projectRoot) {
    return path_1.default.join(projectRoot, "android", "app", "src", "main", "java");
}
function getCurrentPackageName(projectRoot, packageRoot) {
    const mainApplication = config_plugins_1.AndroidConfig.Paths.getProjectFilePath(projectRoot, "MainApplication");
    const packagePath = path_1.default.dirname(mainApplication);
    const packagePathParts = path_1.default
        .relative(packageRoot, packagePath)
        .split(path_1.default.sep)
        .filter(Boolean);
    return packagePathParts.join(".");
}
async function saveFileAsync(path, content) {
    return fs_1.promises.writeFile(path, content, "utf8");
}
function getMainNotificationService(packageName) {
    return `package ${packageName};
import expo.modules.notifications.service.ExpoFirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.intercom.reactnative.IntercomModule;

public class MainNotificationService extends ExpoFirebaseMessagingService {

  @Override
  public void onNewToken(String refreshedToken) {
    IntercomModule.sendTokenToIntercom(getApplication(), refreshedToken);
    super.onNewToken(refreshedToken);
  }

  @Override
  public void onMessageReceived(RemoteMessage remoteMessage) {
    if (IntercomModule.isIntercomPush(remoteMessage)) {
      IntercomModule.handleRemotePushMessage(getApplication(), remoteMessage);
    } else {
      super.onMessageReceived(remoteMessage);
    }
  }
}`;
}
const withIntercomAndroid = (config, { intercomEURegion, androidApiKey, appId, androidIcon, isPushNotificationsEnabledAndroid = false, }) => {
    config = (0, exports.withIntercomAndroidManifest)(config, {
        EURegion: intercomEURegion,
        pushNotifications: isPushNotificationsEnabledAndroid,
    });
    config = (0, exports.withIntercomAppBuildGradle)(config, {
        pushNotifications: isPushNotificationsEnabledAndroid,
    });
    config = (0, exports.withIntercomMainApplication)(config, {
        appId,
        apiKey: androidApiKey,
    });
    if (isPushNotificationsEnabledAndroid) {
        config = withIntercomMainNotificationService(config, {});
        config = withIntercomProjectBuildGradle(config, {});
    }
    if (androidIcon) {
        config = withNotificationIcons(config, { androidIcon });
    }
    return config;
};
exports.withIntercomAndroid = withIntercomAndroid;
const withIntercomAndroidManifest = (config, { EURegion, pushNotifications }) => {
    config = config_plugins_1.AndroidConfig.Permissions.withPermissions(config, [
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.VIBRATE",
    ]);
    return (0, config_plugins_1.withAndroidManifest)(config, async (config) => {
        if (EURegion) {
            config.modResults = await setEURegionTrueAsync(config, config.modResults);
        }
        if (pushNotifications) {
            config.modResults.manifest.$ = config.modResults.manifest.$ = {
                ...config.modResults.manifest.$,
                "xmlns:tools": "http://schemas.android.com/tools",
            };
            if (config.modResults.manifest.application?.[0]) {
                config.modResults.manifest.application[0].service = [
                    ...(config.modResults.manifest.application[0].service ?? []),
                    {
                        $: {
                            "android:name": ".MainNotificationService",
                            "android:exported": "false",
                        },
                        "intent-filter": [
                            {
                                $: {},
                                action: [
                                    {
                                        $: {
                                            "android:name": "com.google.firebase.MESSAGING_EVENT",
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ];
                config.modResults.manifest.application[0].receiver = [
                    ...(config.modResults.manifest.application[0].receiver ?? []),
                    {
                        $: {
                            "android:name": "com.intercom.reactnative.RNIntercomPushBroadcastReceiver",
                            // @ts-ignore
                            "tools:replace": "android:exported",
                            "android:exported": "true",
                        },
                    },
                ];
            }
        }
        return config;
    });
};
exports.withIntercomAndroidManifest = withIntercomAndroidManifest;
const withIntercomProjectBuildGradle = (config) => {
    return (0, config_plugins_1.withProjectBuildGradle)(config, async (config) => {
        const googleClasspath = `classpath 'com.google.gms:google-services:4.3.15'`;
        if (!config.modResults.contents.includes(googleClasspath)) {
            const anchor = `dependencies {`;
            config.modResults.contents = config.modResults.contents.replace(`${anchor}`, `${anchor}\n\t\t${googleClasspath}`);
        }
        return config;
    });
};
const withIntercomAppBuildGradle = (config, { pushNotifications }) => {
    return (0, config_plugins_1.withAppBuildGradle)(config, async (config) => {
        config.modResults.contents = (0, generateCode_1.mergeContents)({
            tag: "okhttp-urlconnection",
            src: config.modResults.contents,
            newSrc: "    implementation 'com.squareup.okhttp3:okhttp-urlconnection:4.10.+'",
            anchor: /dependencies\s*\{/,
            offset: 1,
            comment: "//",
        }).contents;
        if (pushNotifications) {
            const firebaseImp = `implementation 'com.google.firebase:firebase-messaging:23.1.+'`;
            if (!config.modResults.contents.includes(firebaseImp)) {
                const anchor = `implementation "com.facebook.react:react-native:+"  // From node_modules`;
                config.modResults.contents = config.modResults.contents.replace(anchor, `${anchor}
      ${firebaseImp}`);
            }
            const applyPlugin = `apply plugin: 'com.google.gms.google-services'`;
            if (!config.modResults.contents.includes(applyPlugin)) {
                const anchor = `apply from: new File(["node", "--print", "require.resolve('@react-native-community/cli-platform-android/package.json')"].execute(null, rootDir).text.trim(), "../native_modules.gradle");`;
                config.modResults.contents = config.modResults.contents.replace(anchor, `${applyPlugin}\n\n${anchor}`);
            }
        }
        return config;
    });
};
exports.withIntercomAppBuildGradle = withIntercomAppBuildGradle;
const withIntercomMainApplication = (config, { apiKey, appId }) => {
    return (0, config_plugins_1.withMainApplication)(config, async (config) => {
        // AndroidConfig.Manifest.add
        // Modify the project build.gradle
        config.modResults.contents = modifyMainApplication({
            contents: config.modResults.contents,
            apiKey,
            appId,
            packageName: config_plugins_1.AndroidConfig.Package.getPackage(config),
        });
        return config;
    });
};
exports.withIntercomMainApplication = withIntercomMainApplication;
const withIntercomMainNotificationService = (config) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "android",
        async (config) => {
            await createMainNotificationService(config.modRequest.projectRoot);
            return config;
        },
    ]);
};
const createMainNotificationService = async (projectRoot) => {
    const packageRoot = getPackageRoot(projectRoot);
    const packageName = getCurrentPackageName(projectRoot, packageRoot);
    const filePath = path_1.default.join(packageRoot, `${packageName.split(".").join("/")}/MainNotificationService.java`);
    try {
        return await saveFileAsync(filePath, getMainNotificationService(packageName));
    }
    catch (e) {
        config_plugins_1.WarningAggregator.addWarningAndroid("config-plugin-react-native-intercom", `Couldn't create MainNotificationService.java - ${e}.`);
    }
};
const modifyMainApplication = ({ contents, apiKey, appId, packageName, }) => {
    if (!packageName) {
        throw new Error("Android package not found");
    }
    const importLine = `import com.intercom.reactnative.IntercomModule;`;
    if (!contents.includes(importLine)) {
        const packageImport = `package ${packageName};`;
        // Add the import line to the top of the file
        // Replace the first line with the intercom import
        contents = contents.replace(`${packageImport}`, `${packageImport}\n${importLine}`);
    }
    const initLine = `IntercomModule.initialize(this, "${apiKey}", "${appId}");`;
    if (!contents.includes(initLine)) {
        const soLoaderLine = `SoLoader.init(this, /* native exopackage */ false);`;
        // Replace the line SoLoader.init(this, /* native exopackage */ false); with regex
        contents = contents.replace(`${soLoaderLine}`, `${soLoaderLine}\n\t\t${initLine}\n`);
    }
    return contents;
};
// Splitting this function out of the mod makes it easier to test.
async function setEURegionTrueAsync(config, androidManifest) {
    // Get the <application /> tag and assert if it doesn't exist.
    const mainApplication = getMainApplicationOrThrow(androidManifest);
    addMetaDataItemToMainApplication(mainApplication, 
    // value for `android:name`
    "io.intercom.android.sdk.server.region", 
    // value for `android:value`
    "@integer/intercom_server_region_eu");
    return androidManifest;
}
const withNotificationIcons = (config, { androidIcon }) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "android",
        async (config) => {
            await savePushIcon(config.modRequest.projectRoot, androidIcon);
            return config;
        },
    ]);
};
async function savePushIcon(projectRoot, iconPath) {
    await Promise.all(Object.values(DPI_VALUES).map(async ({ folderName, scale }) => {
        const resourcesPath = await config_plugins_1.AndroidConfig.Paths.getResourceFolderAsync(projectRoot);
        const dpiFolderPath = path_1.default.resolve(projectRoot, resourcesPath, folderName);
        if (!(0, fs_1.existsSync)(dpiFolderPath)) {
            (0, fs_1.mkdirSync)(dpiFolderPath, { recursive: true });
        }
        const iconSizePx = BASELINE_PIXEL_SIZE * scale;
        try {
            const resizedIcon = (await (0, image_utils_1.generateImageAsync)({ projectRoot, cacheType: "android-notification" }, {
                src: iconPath,
                width: iconSizePx,
                height: iconSizePx,
                resizeMode: "cover",
                backgroundColor: "transparent",
            })).source;
            (0, fs_1.writeFileSync)(path_1.default.resolve(dpiFolderPath, "intercom_push_icon.png"), resizedIcon);
        }
        catch (e) {
            throw new Error("Encountered an issue resizing Android notification icon: " + e);
        }
    }));
}
