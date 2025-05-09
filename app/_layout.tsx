import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { useFonts } from 'expo-font';
import { Text, View } from 'react-native';
import * as Notifications from "expo-notifications";
import { useEffect } from 'react';
import { init as initDB } from '@/src/db/init';
import { NotificationProvider } from '@/src/contexts/Notification';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
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
        <NotificationProvider>
            <ThemeProvider>
                <Stack screenOptions={{ headerShown: false }} />
            </ThemeProvider>
        </NotificationProvider>
    );
}