import {
  ConfigPlugin,
  IOSConfig,
  withDangerousMod,
} from "@expo/config-plugins";
import fs from "fs/promises";

// TODO: Add push option

const initMethodInvocationBlock = `[IntercomModule initialize:`;
// const pushMethodInvocationBlock = `[IntercomModule setDeviceToken:deviceToken];`;

export function modifyObjcAppDelegate(contents: string): string {
  // Add import
  if (!contents.includes("#import <IntercomModule.h>")) {
    // Replace the first line with the intercom import
    contents = contents.replace(
      /#import "AppDelegate.h"/g,
      `#import "AppDelegate.h"
      #import <IntercomModule.h>`
    );
  }

  // Add invocation
  if (!contents.includes(initMethodInvocationBlock)) {
    // TODO: Determine if this is safe
    contents = contents.replace(
      /return YES;/g,
      `${initMethodInvocationBlock}@"apiKey" withAppId:@"appId"];

      return YES;`
    );
  }

  // TODO: Handle the push notification option
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

export const withIntercomAppDelegate: ConfigPlugin<{ apiKey: string }> = (
  config,
  apiKey
) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const fileInfo = IOSConfig.Paths.getAppDelegate(
        config.modRequest.projectRoot
      );
      let contents = await fs.readFile(fileInfo.path, "utf-8");
      if (fileInfo.language === "objc") {
        contents = modifyObjcAppDelegate(contents);
      } else {
        // TODO: Support Swift
        throw new Error(
          `Cannot add Firebase code to AppDelegate of language "${fileInfo.language}"`
        );
      }
      await fs.writeFile(fileInfo.path, contents);

      return config;
    },
  ]);
};
