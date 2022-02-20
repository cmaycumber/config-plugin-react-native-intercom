import { ConfigPlugin, withDangerousMod, IOSConfig } from "@expo/config-plugins";
import { promises as fs } from 'fs';

export const withIntercomAppDelegate: ConfigPlugin<{
    apiKey: string;
    appId: string;
}> = (config, { apiKey, appId }) => {
    return withDangerousMod(config, [
        "ios",
        async (config) => {
            const fileInfo = IOSConfig.Paths.getAppDelegate(
                config.modRequest.projectRoot
            );
            let contents = await fs.readFile(fileInfo.path, "utf-8");
            if (fileInfo.language === "objc") {
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
            `#import "AppDelegate.h"\n#import <IntercomModule.h>`
        );
    }
    const initMethodInvocationBlock = `[IntercomModule initialize:`;

    // Add invocation
    if (!contents.includes(initMethodInvocationBlock)) {
        // TODO: Determine if this is safe
        contents = contents.replace(
            /return YES;/g,
            `${initMethodInvocationBlock}@"${apiKey}" withAppId:@"${appId}"];\n\n\treturn YES;`
        );
    }

    return contents;
}