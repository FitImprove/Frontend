import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { useFonts } from 'expo-font';
import { Text, View } from 'react-native';

export default function Layout() {
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