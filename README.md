# Expo Config Plugin `@intercom/intercom-react-native`

An unofficial [Expo config plugin](https://docs.expo.io/guides/config-plugins) for easily setting up [React Native Intercom](https://github.com/intercom/intercom-react-native) with expo dev clients

## Installation

### Prerequisites

#### Versions > 1.3

- App project using Expo SDK 45.
- Installed `expo-cli@4.4.4` or later.
- Installed `@intercom/intercom-react-native@3.0.3` or later

#### Versions < 1.3

- App project using Expo SDK 44.
- Installed `expo-cli@4.4.4` or later.
- Installed `@intercom/intercom-react-native`

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
        "appId": "<your-app-id>"
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

<details>
<summary>Add EU Region support</summary>

### On iOS Add to `app.json`

```json
{
  "ios": {
    "infoPlist:":{
        "IntercomRegion": "EU"
      }
  }
}

```

### On Android
```json
{
  "plugins": [
    [
      "config-plugin-react-native-intercom",
      {
        //...
        "intercomEURegion": "true"
      }
    ]
  ]
}
```

</details>

## Android push notifications
If you want push notifications to fire when new messages are sent in a conversation, it is necesssary
to create a push notification channel for these. Push notifications for new conversations require no additoonal setup.
```jsx
useEffect(() => {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('intercom_chat_replies_channel', {
      name: 'Intercom Replies Channel',
      description: 'Channel for intercom replies',
      importance: Notifications.AndroidImportance.MAX,
    })
  }
}, [])
```


## Building and running

You can either:

- use `expo prebuild` or `expo run:android`/`expo run:ios` to update your native projects,
- use _[EAS Build](https://docs.expo.io/build/introduction/)_ to build your development client.

## Contributing

Contributions are very welcome! The package uses `expo-module-scripts` for most tasks. You can find detailed information [at this link](https://github.com/expo/expo/tree/master/packages/expo-module-scripts#-config-plugin).

Please make sure to run `yarn build`/`yarn rebuild` to update the `build` directory before pushing. The CI will fail otherwise.

## Credits

- _the Expo team_

- <https://github.com/expo/config-plugins>

## License

MIT
