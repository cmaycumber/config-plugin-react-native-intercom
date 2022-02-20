import { withAppBuildGradle, ConfigPlugin } from "@expo/config-plugins";
import { mergeContents } from "@expo/config-plugins/build/utils/generateCode";

export const withIntercomAppBuildGradle: ConfigPlugin<{}> = (config) => {

    return withAppBuildGradle(config, async (config) => {
        config.modResults.contents = addAndroidPackagingOptions(
            config.modResults.contents
        ).contents
        return config;
    })
};

const addAndroidPackagingOptions = (src: string) => {
    return mergeContents({
        tag: "okhttp-urlconnection",
        src,
        newSrc: `
        com.squareup.okhttp3:okhttp-urlconnection:4.9.1'
      `,
        anchor: /dependencies(?:\s+)?\{/,
        // Inside the dependencies block.
        offset: 1,
        comment: "//",
    });
};