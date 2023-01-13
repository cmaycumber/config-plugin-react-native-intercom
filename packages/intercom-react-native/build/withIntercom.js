"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const withIntercomAndroid_1 = require("./withIntercomAndroid");
const withIntercomIOS_1 = require("./withIntercomIOS");
/**
 * Apply intercom-react-native configuration for Expo SDK 42 projects.
 */
const withIntercom = (config, props) => {
    const { iosApiKey, androidApiKey } = props;
    // Add ios plugin
    if (iosApiKey) {
        config = (0, withIntercomIOS_1.withIntercomIOS)(config, props);
    }
    // Add android plugin
    if (androidApiKey) {
        config = (0, withIntercomAndroid_1.withIntercomAndroid)(config, props);
    }
    // Return the modified config.
    return config;
};
const pkg = {
    // Prevent this plugin from being run more than once.
    // This pattern enables users to safely migrate off of this
    // out-of-tree `@config-plugins/intercom-react-native` to a future
    // upstream plugin in `intercom-react-native`
    name: "@intercom/intercom-react-native",
    // Indicates that this plugin is dangerously linked to a module,
    // and might not work with the latest version of that module.
    version: "UNVERSIONED",
};
exports.default = (0, config_plugins_1.createRunOncePlugin)(withIntercom, pkg.name, pkg.version);
