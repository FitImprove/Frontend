import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';
import { styles } from '../src/styles/SignInStyles';
import WaveBackground from '../src/components/WaveBackground';
import { Link } from 'expo-router';
import { useState } from 'react';

export default function SignInScreen() {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <WaveBackground />
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
                </View>

                
                <Link href="/forgot-password">
                    <Text style={[styles.forgotPasswordText, { color: theme.text }]}>Forgot password</Text>
                </Link>

                
                <TouchableOpacity activeOpacity={0.8}>
                    <View style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}>
                        <Text style={[styles.buttonText, { color: theme.buttonText }]}>Sign in</Text>
                    </View>
                </TouchableOpacity>

                
                <Link href="/sign-up">
                    <Text style={[styles.linkText, { color: theme.text }]}>I don't have an account yet</Text>
                </Link>
            </View>
        </View>
    );
}