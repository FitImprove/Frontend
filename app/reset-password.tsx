import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { styles } from '@/src/styles/SignInStyles';
import WaveBackground from '../src/components/WaveBackground';
import { Link } from 'expo-router';
import { useState } from 'react';

export default function ResetPasswordScreen() {
    const { theme } = useTheme();
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <WaveBackground />
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
                        />
                    </View>
                </View>

                
                <Link href="/sign-in" asChild>
                    <TouchableOpacity activeOpacity={0.8}>
                        <View style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}>
                            <Text style={[styles.buttonText, { color: theme.buttonText }]}>Confirm</Text>
                        </View>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
}