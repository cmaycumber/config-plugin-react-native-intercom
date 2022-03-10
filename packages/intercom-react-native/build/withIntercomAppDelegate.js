"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withIntercomAppDelegate = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const fs_1 = require("fs");
const withIntercomAppDelegate = (config, { apiKey, appId }) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "ios",
        async (config) => {
            const fileInfo = config_plugins_1.IOSConfig.Paths.getAppDelegate(config.modRequest.projectRoot);
            let contents = await fs_1.promises.readFile(fileInfo.path, "utf-8");
            if (fileInfo.language === "objc") {
                contents = modifyObjcAppDelegate({ contents, apiKey, appId });
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
function modifyObjcAppDelegate({ contents, apiKey, appId, }) {
    // Add import
    if (!contents.includes("#import <IntercomModule.h>")) {
        // Replace the first line with the intercom import
        contents = contents.replace(/#import "AppDelegate.h"/g, `#import "AppDelegate.h"\n#import <IntercomModule.h>`);
    }
    const initMethodInvocationBlock = `[IntercomModule initialize:`;
    // Add invocation
    if (!contents.includes(initMethodInvocationBlock)) {
        // TODO: Determine if this is safe
        contents = contents.replace(/return YES;/g, `${initMethodInvocationBlock}@"${apiKey}" withAppId:@"${appId}"];\n\n\treturn YES;`);
    }
    return contents;
}
