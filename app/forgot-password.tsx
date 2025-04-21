import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { styles } from '@/src/styles/SignInStyles';
import WaveBackground from '../src/components/WaveBackground';
import { Link } from 'expo-router';
import { useState } from 'react';

export default function ForgotPasswordScreen() {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <WaveBackground />
            <View style={styles.innerContainer}>
                <View style={styles.textContainer}>
                    <Text style={[styles.text, { color: theme.text }]}>Password reset</Text>
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
                        />
                    </View>
                </View>

                
                <Link href="/reset-password" asChild>
                    <TouchableOpacity activeOpacity={0.8}>
                        <View style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}>
                            <Text style={[styles.buttonText, { color: theme.buttonText }]}>Send code</Text>
                        </View>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
}