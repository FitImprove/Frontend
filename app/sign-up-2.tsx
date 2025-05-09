import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { styles } from '@/src/styles/SignUpStyles';
import WaveBackground from '../src/components/WaveBackground';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { publicApi, setAuthToken } from "../src/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ErrorPopup from '../src/components/ErrorPopup';

type Role = 'USER' | 'COACH';

export default function SignUpScreen2() {
    const { theme } = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams();

    const { firstName, secondName, username, dateOfBirth, role } = params;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorPopupVisible, setIsErrorPopupVisible] = useState(false);

    const validateForm = () => {
        // Валідація email
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrorMessage('Email must be a valid email address');
            setIsErrorPopupVisible(true);
            return false;
        }

        // Валідація password
        if (
            !password ||
            password.length < 8 ||
            password.length > 128 ||
            !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password)
        ) {
            setErrorMessage('Password must be 8-128 characters long, with at least one uppercase letter, one lowercase letter, and one digit');
            setIsErrorPopupVisible(true);
            return false;
        }

        // Валідація confirmPassword
        if (!confirmPassword || confirmPassword !== password) {
            setErrorMessage('Passwords must match and cannot be empty');
            setIsErrorPopupVisible(true);
            return false;
        }

        return true;
    };

    const handleSignUp = async () => {
        if (validateForm()) {
            try {
                const response = await publicApi.post("/users/signup", {
                    name: firstName,
                    surname: secondName,
                    username: username,
                    dateOfBirth: dateOfBirth,
                    role: role,
                    email: email,
                    password: password,
                });
                const token = response.data.token;
                if (token && response.data.id) {
                    await setAuthToken(token);
                    await AsyncStorage.setItem('role', response.data.role.toString());
                    await AsyncStorage.setItem('userId', response.data.id.toString());
                    console.log('Token saved to AsyncStorage:', token);
                    console.log('Role saved to AsyncStorage:', response.data.role);

                    router.push('/home');
                }
                else {
                    setErrorMessage('No token or user ID received from sign-up response');
                    setIsErrorPopupVisible(true);
                }
            } catch (error) {
                console.error("Error in signUp:", error);
                setErrorMessage('An error occurred during sign-up. Please try again.');
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
                            <Text style={[styles.text, { color: theme.text }]}>Sign up</Text>
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
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Confirm password</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText }]}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm your password"
                                    placeholderTextColor={theme.inputText}
                                    secureTextEntry
                                    autoComplete="off"
                                />
                            </View>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity activeOpacity={0.8} onPress={handleSignUp}>
                                <View style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}>
                                    <Text style={[styles.buttonText, { color: theme.buttonText }]}>Sign Up</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()}>
                                <View style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}>
                                    <Text style={[styles.buttonText, { color: theme.buttonText }]}>Back</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
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