import { View, Text, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';
import { styles } from '../src/styles/SignInStyles';
import WaveBackground from '../src/components/WaveBackground';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { publicApi, setAuthToken } from "../src/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ErrorPopup from '../src/components/ErrorPopup';
import { useRole } from '@/src/contexts/RoleContext';
import { init as initDB } from '@/src/db/init';

export default function SignInScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const [email, setEmail] = useState('roman.ganuschak2@gmail.com');
    const [password, setPassword] = useState('Pass123');
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorPopupVisible, setIsErrorPopupVisible] = useState(false);

    const {role, setRole} = useRole();

    // Валідація форми
    const validateForm = () => {
        // Валідація email
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrorMessage('Please enter a valid email address');
            setIsErrorPopupVisible(true);
            return false;
        }
        // Валідація password
        if (!password || password.length < 6) {
            setErrorMessage('Password must be at least 6 characters long');
            setIsErrorPopupVisible(true);
            return false;
        }

        return true;
    };

    // Функція для входу
    const handleSignIn = async () => {
        if (validateForm()) {
            try {
                const response = await publicApi.post("/users/signIn", {
                    email: email,
                    password: password,
                });
                console.log("Got signin response");

                // Зберігаємо токен у AsyncStorage
                const token = response.data.token;
                if (token) {
                    console.log("Setting data", response.data);
                    await AsyncStorage.clear();
                    await setAuthToken(token);
                    await setRole(response.data.role.toString());
                    await AsyncStorage.setItem('userId', response.data.id.toString());
                    await initDB(response.data.role.toString());
                    console.log('Token saved to AsyncStorage:', token);
                    router.push('/home');
                } else {
                    setErrorMessage('No token received from sign-in response');
                    setIsErrorPopupVisible(true);
                }
            } catch (error) {
                console.error("Error during signin:", error);
                setErrorMessage(error.response?.data?.message || 'Failed to sign in. Please try again.');
                setIsErrorPopupVisible(true);
            }
        }
    };

    const closeErrorPopup = () => {
        setIsErrorPopupVisible(false);
        setErrorMessage('');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <WaveBackground />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: wp('5%'),
                        paddingVertical: hp('2%'),
                    }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.innerContainer}>
                        <View style={styles.textContainer}>
                            <Text style={[styles.text, { color: theme.text }]}>Sign in</Text>
                        </View>

                        <View style={[styles.inputContainer, { backgroundColor: theme.inputContainer, borderColor: theme.borderColor }]}>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Email</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText }]}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Enter your email"
                                    placeholderTextColor={theme.inputText}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="off"
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Password</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText }]}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Enter your password"
                                    placeholderTextColor={theme.inputText}
                                    secureTextEntry
                                    autoComplete="off"
                                />
                            </View>
                        </View>

                        <Link href="/forgot-password">
                            <Text style={[styles.forgotPasswordText, { color: theme.text }]}>Forgot password</Text>
                        </Link>

                        <TouchableOpacity activeOpacity={0.8} onPress={handleSignIn}>
                            <View style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}>
                                <Text style={[styles.buttonText, { color: theme.buttonText }]}>Sign in</Text>
                            </View>
                        </TouchableOpacity>

                        <Link href="/sign-up">
                            <Text style={[styles.linkText, { color: theme.text }]}>I don't have an account yet</Text>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <ErrorPopup
                visible={isErrorPopupVisible}
                message={errorMessage}
                onClose={closeErrorPopup}
            />
        </View>
    );
}