import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { useFonts } from 'expo-font';
import { Text, View } from 'react-native';
import * as Notifications from "expo-notifications";
import { useEffect, useState } from 'react';
import { getRole, Role } from '@/src/utils/api';
import { init as initDB } from '@/src/db/init';
import { Provider as PaperProvider } from 'react-native-paper';

import {NotificationProvider} from "@/src/contexts/Notification";
import { RoleProvider, useRole } from '@/src/contexts/RoleContext';

Notifications.requestPermissionsAsync();
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
        async function init() {
            console.log("Role in init: ", await getRole());
            const role = (await getRole()) || 'USER';
            await initDB(role as Role);
            console.log("Db inited");
        }
        init();
        console.log("Calling registrate task");
    }, []);

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
                <RoleProvider>
                    <PaperProvider>
                        <Stack screenOptions={{ headerShown: false }} />
                    </PaperProvider>
                </RoleProvider>
            </ThemeProvider>
        </NotificationProvider>
    );
}