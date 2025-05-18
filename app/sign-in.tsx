import { View, Text, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';
import { styles } from '../src/styles/SignInStyles';
import WaveBackground from '../src/components/WaveBackground';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { publicApi, setAuthToken } from '../src/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorPopup from '../src/components/ErrorPopup';
import { useRole } from '@/src/contexts/RoleContext';
import { init as initDB } from '@/src/db/init';

/**
 * SignInScreen component handles user authentication via email and password.
 *
 * @remarks
 * - Validates email and password inputs for format and minimum length.
 * - Authenticates users through a public API and stores token, user ID, and role.
 * - Initializes local database based on user role upon successful sign-in.
 * - Redirects to the home screen after authentication or displays error popups.
 * - Uses ThemeContext for styling and WaveBackground for visual design.
 * - Supports responsive design for tablets and phones with react-native-responsive-screen.
 * - Provides links for password recovery and account creation.
 *
 * @returns {JSX.Element} Rendered sign-in interface with input fields, buttons, and navigation links.
 */
export default function SignInScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorPopupVisible, setIsErrorPopupVisible] = useState(false);

    const { setRole } = useRole();

    /**
     * Validates the sign-in form inputs
     * @returns {boolean} True if the form is valid, false otherwise
     */
    const validateForm = () => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrorMessage('Please enter a valid email address');
            setIsErrorPopupVisible(true);
            return false;
        }

        if (!password || password.length < 6) {
            setErrorMessage('Password must be at least 6 characters long');
            setIsErrorPopupVisible(true);
            return false;
        }

        return true;
    };

    /**
     * Handles the sign-in process
     */
    const handleSignIn = async () => {
        if (validateForm()) {
            try {
                console.log('hi');
                const response = await publicApi.post('/users/signIn', {
                    email: email,
                    password: password,
                });

                const token = response.data.token;
                if (token) {
                    await AsyncStorage.clear();
                    await setAuthToken(token);
                    await setRole(response.data.role.toString());
                    await AsyncStorage.setItem('userId', response.data.id.toString());
                    await initDB(response.data.role.toString());

                    setEmail('');
                    setPassword('');
                    setErrorMessage('');
                    setIsErrorPopupVisible(false);
                    router.push('/home');
                } else {
                    setErrorMessage('No token received from sign-in response');
                    setIsErrorPopupVisible(true);
                }
            } catch (error) {
                console.error('Error during signin:', error);
                setErrorMessage(error as string);

                setIsErrorPopupVisible(true);
            }
        }
    };

    /**
     * Closes the error popup
     */
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
                    keyboardShouldPersistTaps='handled'
                >
                    <View style={styles.innerContainer}>
                        <Text testID='error-message'>{errorMessage}</Text>
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
                                    placeholder='Enter your email'
                                    placeholderTextColor={theme.inputText}
                                    keyboardType='email-address'
                                    autoCapitalize='none'
                                    autoComplete='off'
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Password</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText }]}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder='Enter your password'
                                    placeholderTextColor={theme.inputText}
                                    secureTextEntry
                                    autoComplete='off'
                                />
                            </View>
                        </View>

                        <Link href='/forgot-password'>
                            <Text style={[styles.forgotPasswordText, { color: theme.text }]}>Forgot password</Text>
                        </Link>

                        <TouchableOpacity testID='sign-in-button' activeOpacity={0.8} onPress={handleSignIn}>
                            <View style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}>
                                <Text style={[styles.buttonText, { color: theme.buttonText }]}>Sign in</Text>
                            </View>
                        </TouchableOpacity>

                        <Link href='/sign-up'>
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