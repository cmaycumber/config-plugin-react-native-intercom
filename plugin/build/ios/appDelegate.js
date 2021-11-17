"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withIntercomAppDelegate = exports.modifyObjcAppDelegate = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const promises_1 = __importDefault(require("fs/promises"));
const initMethodInvocationBlock = `[IntercomModule initialize:`;
const pushMethodInvocationBlock = `[IntercomModule setDeviceToken:deviceToken];`;
function modifyObjcAppDelegate(contents) {
    // Add import
    if (!contents.includes("#import <IntercomModule.h>")) {
        // Replace the first line with the intercom import
        contents = contents.replace(/#import "AppDelegate.h"/g, `#import "AppDelegate.h"
      #import <IntercomModule.h>`);
    }
    // Add invocation
    if (!contents.includes(initMethodInvocationBlock)) {
        // TODO: Determine if this is safe
        contents = contents.replace(/return YES;/g, `${initMethodInvocationBlock}@"apiKey" withAppId:@"appId"];

      return YES;`);
    }
    // Replace the first occurrence of end to add the push method for intercom
    // Only if we add push notifications
    // if (!contents.includes(pushMethodInvocationBlock)) {
    //   contents.replace(
    //     '@end',
    //     `
    //   - (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    //       [IntercomModule setDeviceToken:deviceToken];
    //   }
    //   @end`
    //   );
    // }
    return contents;
}
exports.modifyObjcAppDelegate = modifyObjcAppDelegate;
const withIntercomAppDelegate = (config, apiKey) => {
    return config_plugins_1.withDangerousMod(config, [
        "ios",
        async (config) => {
            const fileInfo = config_plugins_1.IOSConfig.Paths.getAppDelegate(config.modRequest.projectRoot);
            let contents = await promises_1.default.readFile(fileInfo.path, "utf-8");
            if (fileInfo.language === "objc") {
                contents = modifyObjcAppDelegate(contents);
            }
            else {
                // TODO: Support Swift
                throw new Error(`Cannot add Firebase code to AppDelegate of language "${fileInfo.language}"`);
            }
            await promises_1.default.writeFile(fileInfo.path, contents);
            return config;
        },
    ]);
};
exports.withIntercomAppDelegate = withIntercomAppDelegate;
