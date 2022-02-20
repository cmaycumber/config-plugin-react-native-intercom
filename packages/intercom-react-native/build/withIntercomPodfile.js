"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withIntercomPodfile = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const withIntercomPodfile = (config, { experimentalBumpMinIosPlatformVersion }) => {
    if (experimentalBumpMinIosPlatformVersion) {
        return (0, config_plugins_1.withDangerousMod)(config, [
            "ios",
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            async (config) => {
                const file = path_1.default.join(config.modRequest.platformProjectRoot, "Podfile");
                const contents = await fs_1.promises.readFile(file, "utf8");
                await fs_1.promises.writeFile(file, bumpMinPlatformVersion(contents), "utf-8");
                return config;
            },
        ]);
    }
    return config;
};
exports.withIntercomPodfile = withIntercomPodfile;
function bumpMinPlatformVersion(src) {
    // Bumps the platform version inside of the podfile
    return src.replace(`platform :ios, '12.0'`, `platform :ios, '13.0'`);
}
