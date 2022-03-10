import { withProjectBuildGradle, AndroidConfig, ConfigPlugin } from "@expo/config-plugins";

export const withIntercomProjectBuildGradle: ConfigPlugin<{}> = (config) => {
    return withProjectBuildGradle(config, async (config) => {        
        config.modResults.contents = AndroidConfig.Version.setMinBuildScriptExtVersion(config.modResults.contents, {
            name: 'compileSdkVersion',
            minVersion: 31
        })
        return config;
    })
};