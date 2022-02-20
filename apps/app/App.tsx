import React, { useEffect } from 'react';
import { View, Button } from 'react-native'
import Intercom from '@intercom/intercom-react-native';

export default function App() {

    useEffect(() => {
        Intercom.registerUnidentifiedUser()
    }, [])

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button title="Open Intercom Messenger" onPress={() => Intercom.displayMessenger()} />
            <Button title="Open Intercom Help Center" onPress={() => Intercom.displayHelpCenter()} />
        </View>
    )
}