import { View, Text, TextInput, TouchableOpacity, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { styles } from '@/src/styles/SignInStyles';
import WaveBackground from '../src/components/WaveBackground';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { publicApi } from "@/src/utils/api";
import ErrorPopup from '../src/components/ErrorPopup';

export default function ResetPasswordScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorPopupVisible, setIsErrorPopupVisible] = useState(false);

    const token = params.token;

    const validateForm = () => {
        if (!newPassword || newPassword.length < 6) {
            setErrorMessage('Password must be at least 6 characters long');
            setIsErrorPopupVisible(true);
            return false;
        }

        if (newPassword !== confirmNewPassword) {
            setErrorMessage('Passwords do not match');
            setIsErrorPopupVisible(true);
            return false;
        }

        return true;
    };

    const handleResetPassword = async () => {
        if (!validateForm()) return;

        try {
            await publicApi.post('/set-new-password', {
                token: token,
                password: newPassword,
            });
            router.push('/sign-in');
        } catch (error) {
            console.error("Error during password reset:", error);
            setErrorMessage(
                error.response?.status === 404
                    ? 'Token not found'
                    : error.response?.status === 400
                        ? 'Invalid token or password'
                        : 'Failed to reset password. Please try again.'
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
                            <Text style={[styles.text, { color: theme.text }]}>Password reset</Text>
                        </View>

                        <View style={[styles.inputContainer, { backgroundColor: theme.inputContainer, borderColor: theme.borderColor }]}>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>New password</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText }]}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Enter new password"
                                    placeholderTextColor={theme.inputText}
                                    secureTextEntry
                                    autoComplete="off"
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Confirm new password</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText }]}
                                    value={confirmNewPassword}
                                    onChangeText={setConfirmNewPassword}
                                    placeholder="Confirm new password"
                                    placeholderTextColor={theme.inputText}
                                    secureTextEntry
                                    autoComplete="off"
                                />
                            </View>
                        </View>

                        <TouchableOpacity activeOpacity={0.8} onPress={handleResetPassword}>
                            <View style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}>
                                <Text style={[styles.buttonText, { color: theme.buttonText }]}>Confirm</Text>
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