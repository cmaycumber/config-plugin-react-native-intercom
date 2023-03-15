"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withIntercomAppDelegate = exports.withIntercomInfoPlist = exports.withIntercomIOS = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const fs_1 = require("fs");
const withIntercomIOS = (config, { iosPhotoUsageDescription, appId, iosApiKey, isPushNotificationsEnabledIOS = false, }) => {
    config = (0, exports.withIntercomInfoPlist)(config, {
        iosPhotoUsageDescription,
    });
    config = (0, exports.withIntercomAppDelegate)(config, {
        apiKey: iosApiKey,
        appId,
        pushNotifications: isPushNotificationsEnabledIOS,
    });
    return config;
};
exports.withIntercomIOS = withIntercomIOS;
const withIntercomInfoPlist = (config, { iosPhotoUsageDescription }) => {
    return (0, config_plugins_1.withInfoPlist)(config, async (config) => {
        // Add on the right permissions for expo to use the photo library, this might change if we add more permissions
        if (!config.modResults.NSPhotoLibraryUsageDescription) {
            config.modResults.NSPhotoLibraryUsageDescription =
                iosPhotoUsageDescription ?? "Upload images to support center";
        }
        return config;
    });
};
exports.withIntercomInfoPlist = withIntercomInfoPlist;
const withIntercomAppDelegate = (config, { apiKey, appId, pushNotifications }) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "ios",
        async (config) => {
            const fileInfo = config_plugins_1.IOSConfig.Paths.getAppDelegate(config.modRequest.projectRoot);
            let contents = await fs_1.promises.readFile(fileInfo.path, "utf-8");
            if (fileInfo.language === "objcpp" || fileInfo.language === "objc") {
                contents = modifyObjcAppDelegate({
                    contents,
                    apiKey,
                    appId,
                    pushNotifications,
                });
            }
            else {
                throw new Error(`Cannot add Intercom code to AppDelegate of language "${fileInfo.language}"`);
            }
            await fs_1.promises.writeFile(fileInfo.path, contents);
            return config;
        },
    ]);
};
exports.withIntercomAppDelegate = withIntercomAppDelegate;
function modifyObjcAppDelegate({ contents, apiKey, appId, pushNotifications, }) {
    // Add import
    if (!contents.includes("#import <IntercomModule.h>")) {
        // Replace the first line with the intercom import
        contents = contents.replace(/#import "AppDelegate.h"/g, `#import "AppDelegate.h"\n#import <IntercomModule.h>\n#import <UserNotifications/UserNotifications.h>`);
    }
    const initMethodInvocationBlock = `[IntercomModule initialize:`;
    const registerIntercomPushCode = `
  // START INTERCOM PUSH
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  [center requestAuthorizationWithOptions:(UNAuthorizationOptionAlert + UNAuthorizationOptionSound)
                          completionHandler:^(BOOL granted, NSError *_Nullable error) {
                          }];
  [[UIApplication sharedApplication] registerForRemoteNotifications];
  // END INTERCOM PUSH
  `;
    const registerPushLine = `[IntercomModule setDeviceToken:deviceToken];`;
    const registerPushAnchor = `return [super application:application didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];`;
    // Add invocation
    if (!contents.includes(initMethodInvocationBlock)) {
        // TODO: Determine if this is safe
        contents = contents.replace(/return \[super application:application didFinishLaunchingWithOptions:launchOptions\];/g, `${initMethodInvocationBlock}@"${apiKey}" withAppId:@"${appId}"];\n\n${pushNotifications ? registerIntercomPushCode : ""}\n\n\treturn \[super application:application didFinishLaunchingWithOptions:launchOptions\];`);
    }
    if (!contents.includes(registerPushLine) && pushNotifications) {
        contents = contents.replace(registerPushAnchor, `${registerPushLine}\n\t${registerPushAnchor}`);
    }
    return contents;
}
