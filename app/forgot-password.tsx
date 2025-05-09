import { View, Text, TextInput, TouchableOpacity, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { styles } from '@/src/styles/SignInStyles';
import WaveBackground from '../src/components/WaveBackground';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { api } from "../src/utils/api";
import ErrorPopup from '../src/components/ErrorPopup';

export default function ForgotPasswordScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorPopupVisible, setIsErrorPopupVisible] = useState(false);
    const [isSendButtonDisabled, setIsSendButtonDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const CODE_LENGTH = 19;

    const validateEmail = () => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrorMessage('Please enter a valid email address');
            setIsErrorPopupVisible(true);
            return false;
        }
        return true;
    };

    const handleSendCode = async () => {
        if (!validateEmail()) return;

        try {
            await api.post(`password/recover/${email}`);
            setIsSendButtonDisabled(true);
            setCountdown(60);
        } catch (error) {
            console.error("Error during password recovery:", error);
            setErrorMessage(
                error.response?.status === 404
                    ? 'User with this email not found'
                    : error.response?.status === 400
                        ? 'Invalid email'
                        : 'Failed to send recovery email. Please try again.'
            );
            setIsErrorPopupVisible(true);
        }
    };

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        setIsSendButtonDisabled(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    useEffect(() => {
        if (code.length === CODE_LENGTH) {
            checkCode();
        }
    }, [code]);

    const checkCode = async () => {
        try {
            const response = await api.post(`/check-code/${code}`);
            if (response.data) {
                router.push({
                    pathname: '/reset-password',
                    params: { token: code },
                });
            } else {
                setErrorMessage('Invalid code. Please try again.');
                setIsErrorPopupVisible(true);
            }
        } catch (error) {
            console.error("Error during code verification:", error);
            setErrorMessage(
                error.response?.status === 404
                    ? 'Code not found'
                    : error.response?.status === 400
                        ? 'Invalid code'
                        : 'Failed to verify code. Please try again.'
            );
            setIsErrorPopupVisible(true);
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
                            <Text style={[styles.text, {resieText: true, color: theme.text }]}>Password reset</Text>
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
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Code</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText }]}
                                    value={code}
                                    onChangeText={setCode}
                                    placeholder="Enter the code"
                                    placeholderTextColor={theme.inputText}
                                    keyboardType="numeric"
                                    maxLength={CODE_LENGTH}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleSendCode}
                            disabled={isSendButtonDisabled}
                        >
                            <View
                                style={[
                                    styles.button,
                                    {
                                        backgroundColor: isSendButtonDisabled
                                            ? theme.buttonBackgroundDisabled || '#cccccc'
                                            : theme.buttonBackground,
                                        borderColor: theme.borderColor,
                                    },
                                ]}
                            >
                                <Text style={[styles.buttonText, { color: theme.buttonText }]}>
                                    {isSendButtonDisabled ? `Send code (${countdown}s)` : 'Send code'}
                                </Text>
                            </View>
                        </TouchableOpacity>
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