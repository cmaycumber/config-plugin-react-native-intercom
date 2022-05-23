# Expo Config Plugin `@intercom/intercom-react-native`

An [Expo config plugin](https://docs.expo.io/guides/config-plugins) for easily setting up [React Native Intercom](https://github.com/intercom/intercom-react-native)

## Installation

#### Prerequisites

- App project using Expo SDK 41+.
- Installed `expo-cli@4.4.4` or later.
- Installed `@intercom/intercom-react-native` JavaScript libraries:

#### With `expo install`

```
expo install config-plugin-react-native-intercom
```

#### Without `expo install`

```sh
# using yarn
yarn add config-plugin-react-native-intercom

# using npm
npm install config-plugin-react-native-intercom
```

Open your `app.json` and update your `plugins` section (`expo install` would do it for you):

```json
{
  "plugins": ["config-plugin-react-native-intercom"]
}
```

## Configuration

The plugin needs your intercom api key so that it can communicate with the intercom application.

```json
{
  "plugins": [
    [
      "config-plugin-react-native-intercom",
      {
        "iosApiKey": "<your-api-key>",
        "androidApiKey": "<your-api-key>",
        "appId": "<your-app-id>",
        "isPushNotificationsEnabledIOS": "<boolean>"
      }
    ]
  ]
}
```

### Other configuration options

<details>
<summary>Add a custom photo usage description</summary>

```json
{
  "plugins": [
    [
      "config-plugin-react-native-intercom",
      {
        //...
        "iosPhotoUsageDescription": "Upload to support center"
      }
    ]
  ]
}
```

</details>

## Building and running

You can either:

- use `expo prebuild` or `expo run:android`/`expo run:ios` to update your native projects,
- use _[EAS Build](https://docs.expo.io/build/introduction/)_ to build your development client.

## Contributing

Contributions are very welcome! The package uses `expo-module-scripts` for most tasks. You can find detailed information [at this link](https://github.com/expo/expo/tree/master/packages/expo-module-scripts#-config-plugin).

Please make sure to run `yarn build`/`yarn rebuild` to update the `build` directory before pushing. The CI will fail otherwise.

## Credits

- _the Expo team_

- [@barthap](https://github.com/cmaycumber) - <https://github.com/cmaycumber/with-rn-firebase>

- <https://github.com/expo/config-plugins>

## License

MIT
