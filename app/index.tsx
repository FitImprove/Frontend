import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { styles } from '@/src/styles/HomeScreenStyles';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import WaveBackground from "@/src/components/WaveBackground";
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * HomeScreen component serves as the landing page for unauthenticated users.
 *
 * @remarks
 * - Checks for a valid JWT token in AsyncStorage on mount to determine user authentication status.
 * - Automatically redirects authenticated users with a valid token to the home route.
 * - Displays a loading indicator while verifying the token.
 * - Provides navigation links for signing in or signing up for new users.
 * - Uses theming context to adapt styles dynamically based on the current theme.
 * - Includes a background wave animation and welcome image for improved UX.
 * - Uses Expo Router's navigation methods to manage route transitions.
 *
 * @returns {JSX.Element} A screen with sign-in and sign-up buttons, or redirects to authenticated home.
 */
export default function HomeScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (token) {

                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const expirationTime = payload.exp;
                    const currentTime = Math.floor(Date.now() / 1000);


                    if (expirationTime > currentTime) {
                        router.replace('/home');
                    } else {
                        await AsyncStorage.removeItem('token');
                        setIsLoading(false);
                    }
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error checking token:', error);
                await AsyncStorage.removeItem('token'); 
                setIsLoading(false);
            }
        };

        checkToken();
    }, []);

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.text }}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <WaveBackground />
            <SafeAreaView style={{ flex: 1 }} edges={[]}>
                {/* Зображення */}
                <Image
                    source={require('../assets/images/welcome-image.png')}
                    style={[styles.image, { borderColor: theme.borderColor }]}
                    resizeMode="cover"
                />

                {/* Текст */}
                <View style={styles.textContainer}>
                    <Text style={[styles.text, { color: theme.text }]}>
                        Get Started on Your{'\n'}Fitness Journey –{'\n'}Sign Up or Log In!
                    </Text>
                </View>

                {/* Кнопки */}
                <View style={styles.buttonContainer}>
                    <Link href="/sign-in" asChild>
                        <TouchableOpacity activeOpacity={0.8}>
                            <View
                                style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}
                            >
                                <Text style={[styles.buttonText, { color: theme.buttonText }]}>Sign in</Text>
                            </View>
                        </TouchableOpacity>
                    </Link>
                    <Link href="/sign-up" asChild>
                        <TouchableOpacity activeOpacity={0.8}>
                            <View
                                style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}
                            >
                                <Text style={[styles.buttonText, { color: theme.buttonText }]}>Sign up</Text>
                            </View>
                        </TouchableOpacity>
                    </Link>

                    {/* TEMPORARY just for testing */}
                    <Link href="/home" asChild>
                        <TouchableOpacity activeOpacity={0.8}>
                            <View
                                style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}
                            >
                                <Text style={[styles.buttonText, { color: theme.buttonText }]}>Home</Text>
                            </View>
                        </TouchableOpacity>
                    </Link>
                </View>
            </SafeAreaView>
        </View>
    );
}