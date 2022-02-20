import { ConfigPlugin, withDangerousMod } from "@expo/config-plugins";
import { mergeContents } from "@expo/config-plugins/build/utils/generateCode";
import { promises as fs } from 'fs';
import path from 'path';

export const withIntercomPodfile: ConfigPlugin<{
    experimentalBumpMinIosPlatformVersion: boolean;
}> = (config, { experimentalBumpMinIosPlatformVersion }) => {
    if (experimentalBumpMinIosPlatformVersion) {
        return withDangerousMod(config, [
            "ios",
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            async (config) => {
                const file = path.join(config.modRequest.platformProjectRoot, "Podfile");

                const contents = await fs.readFile(file, "utf8");

                await fs.writeFile(file, bumpMinPlatformVersion(contents), "utf-8");
                return config;
            },
        ]);
    }
    return config;
};

function bumpMinPlatformVersion(src: string): string {
    // Bumps the platform version inside of the podfile
    return src.replace(`platform :ios, '12.0'`, `platform :ios, '13.0'`);
}