import {View, Text, TextInput, TouchableOpacity, Modal} from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { styles } from '@/src/styles/SignUpStyles';
import WaveBackground from '../src/components/WaveBackground';

import { Link } from 'expo-router';
import {useState} from "react";
type Role = 'User' | 'Trainer';
export default function SignUpScreen() {
    const { theme } = useTheme();
    const [role, setRole] = useState<Role | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <WaveBackground />
            <View style={styles.innerContainer}>
                {/* Заголовок */}
                <View style={styles.textContainer}>
                    <Text style={[styles.text, { color: theme.text }]}>Sign up</Text>
                </View>

                {/* Поля введення */}
                <View style={[styles.inputContainer, {backgroundColor: theme.inputContainer, borderColor: theme.borderColor }]}>
                    <View style={styles.inputWrapper}>
                        <Text style={[styles.label, { color: theme.textOnElement }]}>First name</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText}]}
                            placeholder="Enter first name"
                            placeholderTextColor={theme.inputText}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={[styles.label, { color: theme.textOnElement }]}>Second name</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText}]}
                            placeholder="Enter second name"
                            placeholderTextColor={theme.inputText}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={[styles.label, { color: theme.textOnElement }]}>Username</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText}]}
                            placeholder="Enter username"
                            placeholderTextColor={theme.inputText}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={[styles.label, { color: theme.textOnElement }]}>Date of birthday</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText}]}
                            placeholder="Enter date of birthday"
                            placeholderTextColor={theme.inputText}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={[styles.label, { color: theme.textOnElement }]}>Role</Text>
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            style={[styles.roleField, { backgroundColor: theme.inputBackground }]}
                        >
                            <Text style={[styles.roleText, { color: theme.inputText }]}>
                                {role || 'Select role'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Кнопка "Continue" */}
                <Link href="/sign-up-2" asChild>
                    <TouchableOpacity activeOpacity={0.8}>
                        <View style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}>
                            <Text style={[styles.buttonText, { color: theme.buttonText }]}>Continue</Text>
                        </View>
                    </TouchableOpacity>
                </Link>

                {/* Текст "I already have an account" */}
                <Link href="/sign-in">
                    <Text style={[styles.linkText, { color: theme.text }]}>I already have an account</Text>
                </Link>
            </View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background, borderColor: theme.inputBorder }]}>
                        <TouchableOpacity
                            style={[styles.modalContent, { backgroundColor: theme.background, borderColor: theme.inputBorder }]}
                            onPress={() => {
                                setRole('User');
                                setModalVisible(false);
                            }}
                        >
                            <Text style={[styles.modalOptionText, {color: theme.inputText}]}>User</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalContent, { backgroundColor: theme.background, borderColor: theme.inputBorder }]}
                            onPress={() => {
                                setRole('Trainer');
                                setModalVisible(false);
                            }}
                        >
                            <Text style={[styles.modalOptionText, {color: theme.inputText}]}>Trainer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}