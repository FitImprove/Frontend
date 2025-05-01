import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { styles } from '@/src/styles/SignUpStyles';
import WaveBackground from '../src/components/WaveBackground';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import {publicApi, setAuthToken} from "../src/utils/api";
type Role = 'USER' | 'COACH';

export default function SignUpScreen2() {
    const { theme } = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams();

    const { firstName, secondName, username, dateOfBirth, role } = params;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [errors, setErrors] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            email: '',
            password: '',
            confirmPassword: '',
        };

        // Валідація email
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Email must be a valid email address';
            isValid = false;
        }

        // Валідація password
        if (
            !password || // Перевіряємо, чи поле порожнє
            password.length < 8 ||
            password.length > 128 ||
            !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password)
        ) {
            newErrors.password = 'Password must be 8-128 characters long, with at least one uppercase letter, one lowercase letter, and one digit';
            isValid = false;
        }

        // Валідація confirmPassword
        if (!confirmPassword || confirmPassword !== password) {
            newErrors.confirmPassword = 'Passwords must match and cannot be empty';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSignUp = async () => {
        if (validateForm()) {
            console.log({
                firstName,
                secondName,
                username,
                dateOfBirth,
                role: role as Role,
                email,
                password,
            });
            try {
                const response = await publicApi.post("/users/signup",
                    {name: firstName, surname: secondName, username: username, dateOfBirth: dateOfBirth, role: role, email:email, password:password});
                console.log(response.data);
                const newToken = response.data.token;
                await setAuthToken(newToken);
            }catch (error) {
                    console.error("Error in cancelTrainig:", error);
            }
            router.push('/main');
        }
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
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setErrors((prev) => ({ ...prev, email: '' }));
                                    }}
                                    placeholder="Enter your email"
                                    placeholderTextColor={theme.inputText}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="off" // Вимикаємо автозаповнення для email
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Password</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText }]}
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        setErrors((prev) => ({ ...prev, password: '' }));
                                    }}
                                    placeholder="Enter your password"
                                    placeholderTextColor={theme.inputText}
                                    secureTextEntry
                                    autoComplete="off" // Вимикаємо автозаповнення для пароля
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Confirm password</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText }]}
                                    value={confirmPassword}
                                    onChangeText={(text) => {
                                        setConfirmPassword(text);
                                        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                                    }}
                                    placeholder="Confirm your password"
                                    placeholderTextColor={theme.inputText}
                                    secureTextEntry
                                    autoComplete="off" // Вимикаємо автозаповнення для підтвердження пароля
                                />
                            </View>
                        </View>

                        {Object.values(errors).some((error) => error) && (
                            <View style={{ marginVertical: hp('1%'), alignItems: 'center' }}>
                                {errors.email ? (
                                    <Text style={{ color: 'red', fontSize: wp('3%') }}>{errors.email}</Text>
                                ) : errors.password ? (
                                    <Text style={{ color: 'red', fontSize: wp('3%') }}>{errors.password}</Text>
                                ) : errors.confirmPassword ? (
                                    <Text style={{ color: 'red', fontSize: wp('3%') }}>{errors.confirmPassword}</Text>
                                ) : null}
                            </View>
                        )}

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
        </View>
    );
}