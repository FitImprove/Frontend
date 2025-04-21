import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { styles } from '@/src/styles/SignUpStyles';
import WaveBackground from '../src/components/WaveBackground';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';

export default function SignUpScreen2() {
    const { theme } = useTheme();
    const router = useRouter(); // Для навігації назад

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <WaveBackground />
            <View style={styles.innerContainer}>
                {/* Заголовок */}
                <View style={styles.textContainer}>
                    <Text style={[styles.text, { color: theme.text }]}>Sign up</Text>
                </View>

                {/* Поля введення */}
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
                        />
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity activeOpacity={0.8}>
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
        </View>
    );
}