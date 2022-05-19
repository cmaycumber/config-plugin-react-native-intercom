import React, { useEffect } from 'react';
import { View, Button } from 'react-native'
import Intercom from '@intercom/intercom-react-native';

export default function App() {

    useEffect(() => {
        console.log('Register intercom');
        Intercom.registerUnidentifiedUser()
    }, [])

    const openMessenger = async () => {
        try {
            const response = await Intercom.displayMessenger();
            console.log('Opened messenger: ', response);
        } catch (err) {
            console.log('Error: ', err);
        }
    }

    const displayHelpCenter = async () => {
        try {
            const response = await Intercom.displayHelpCenter();
            console.log('Opened help center: ', response);
        } catch (err) {
            console.log('Error: ', err);
        }
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button title="Open Intercom Messenger" onPress={openMessenger} />
            <Button title="Open Intercom Help Center" onPress={displayHelpCenter} />
        </View>
    )
}