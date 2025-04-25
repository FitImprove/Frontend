import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { useFonts } from 'expo-font';
import { Text, View } from 'react-native';
import * as Notifications from "expo-notifications";
import { useEffect } from 'react';
import api from '@/src/utils/api';
import { init as initDB } from '@/src/db/init';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export default function Layout() {
    useEffect(() => {
        initDB();
    });

    const [fontsLoaded] = useFonts({
        'InriaSerif-Regular': require('../assets/fonts/InriaSerif-Regular.ttf'),
    });

    if (!fontsLoaded) {
        return (
            <View >
                <Text>Loading fonts...</Text>
            </View>
        );
    }

    return (
        <ThemeProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
    );
}