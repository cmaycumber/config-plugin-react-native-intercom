import { ConfigPlugin, withDangerousMod, IOSConfig } from "@expo/config-plugins";
import { promises as fs } from "fs";

export const withIntercomAppDelegate: ConfigPlugin<{
  apiKey: string;
  appId: string;
}> = (config, { apiKey, appId }) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const fileInfo = IOSConfig.Paths.getAppDelegate(config.modRequest.projectRoot);
      let contents = await fs.readFile(fileInfo.path, "utf-8");
      if (fileInfo.language === "objcpp" || fileInfo.language === "objc") {
        contents = modifyObjcAppDelegate({ contents, apiKey, appId });
      } else {
        throw new Error(
          `Cannot add Intercom code to AppDelegate of language "${fileInfo.language}"`
        );
      }
      await fs.writeFile(fileInfo.path, contents);
      return config;
    },
  ]);
};

function modifyObjcAppDelegate({
  contents,
  apiKey,
  appId,
}: {
  contents: string;
  apiKey: string;
  appId: string;
}): string {
  // Add import
  if (!contents.includes("#import <IntercomModule.h>")) {
    // Replace the first line with the intercom import
    contents = contents.replace(
      /#import "AppDelegate.h"/g,
      `#import "AppDelegate.h"\n#import <IntercomModule.h>\n#import <UserNotifications/UserNotifications.h>`
    );
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
    contents = contents.replace(
      /return YES;/g,
      `${initMethodInvocationBlock}@"${apiKey}" withAppId:@"${appId}"];\n\n${registerIntercomPushCode}\n\n\treturn YES;`
    );

    contents = contents.replace(registerPushAnchor, `${registerPushLine}\n\t${registerPushAnchor}`);
  }

  return contents;
}
