import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { styles } from '@/src/styles/SignUpStyles';
import WaveBackground from '../src/components/WaveBackground';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import ErrorPopup from '../src/components/ErrorPopup';

/**
 * Type for user role
 * @typedef Role
 */
type Role = 'USER' | 'COACH';

/**
 * SignUpScreen component handles the first step of user registration.
 *
 * @remarks
 * - Collects and validates first name, second name, username, date of birth, and role.
 * - Uses a modal for selecting user role (USER or COACH).
 * - Navigates to the next registration step with validated data.
 * - Applies ThemeContext for styling and WaveBackground for visual design.
 * - Supports responsive design for tablets and phones with react-native-responsive-screen.
 * - Displays error popups for invalid inputs with detailed feedback.
 * - Provides a link to the sign-in screen for existing users.
 *
 * @returns {JSX.Element} Rendered sign-up interface with input fields, role selection, and navigation.
 */
export default function SignUpScreen() {
    const { theme } = useTheme();

    const [firstName, setFirstName] = useState('');
    const [secondName, setSecondName] = useState('');
    const [username, setUsername] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [role, setRole] = useState<Role | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorPopupVisible, setIsErrorPopupVisible] = useState(false);

    /**
     * Validates the sign-up form inputs
     * @returns {boolean} True if the form is valid, false otherwise
     */
    const validateForm = () => {
        if (
            !firstName ||
            firstName.length < 1 ||
            firstName.length > 128 ||
            !/^[a-zA-Z\u00C0-\u1EF9]+$/u.test(firstName)
        ) {
            setErrorMessage('First name must be 1-128 characters long and contain only letters');
            setIsErrorPopupVisible(true);
            return false;
        }

        if (
            !secondName ||
            secondName.length < 1 ||
            secondName.length > 128 ||
            !/^[a-zA-Z\u00C0-\u1EF9]+$/u.test(secondName)
        ) {
            setErrorMessage('Second name must be 1-128 characters long and contain only letters');
            setIsErrorPopupVisible(true);
            return false;
        }

        if (
            !username ||
            username.length < 3 ||
            username.length > 128 ||
            !/^[a-zA-Z0-9_]+$/.test(username)
        ) {
            setErrorMessage('Username must be 3-128 characters long and contain only English letters, digits, and _');
            setIsErrorPopupVisible(true);
            return false;
        }

        if (!dateOfBirth) {
            setErrorMessage('Date of birth must be in format DD.MM.YYYY and be a valid date');
            setIsErrorPopupVisible(true);
            return false;
        } else {
            const isFormatValid = /^\d{2}\.\d{2}\.\d{4}$/.test(dateOfBirth);
            const [day, month, year] = dateOfBirth.split('.').map(Number);
            const date = new Date(year, month - 1, day);
            const isDateValid =
                date.getFullYear() === year &&
                date.getMonth() + 1 === month &&
                date.getDate() === day &&
                year >= 1900 &&
                year <= new Date().getFullYear();

            if (!isFormatValid || !isDateValid) {
                setErrorMessage('Date of birth must be in format DD.MM.YYYY and be a valid date');
                setIsErrorPopupVisible(true);
                return false;
            }
        }

        if (!role) {
            setErrorMessage('Please select a role');
            setIsErrorPopupVisible(true);
            return false;
        }

        return true;
    };

    /**
     * Navigates to the next registration step with validated data
     */
    const handleContinue = () => {
        if (validateForm()) {
            router.push({
                pathname: '/sign-up-2',
                params: { firstName, secondName, username, dateOfBirth, role },
            });
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
                        <View style={styles.textContainer}>
                            <Text style={[styles.text, { color: theme.text }]}>Sign up</Text>
                        </View>

                        <View style={[styles.inputContainer, { backgroundColor: theme.inputContainer, borderColor: theme.borderColor }]}>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>First name</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText }]}
                                    placeholder='Enter first name'
                                    placeholderTextColor={theme.inputText}
                                    value={firstName}
                                    onChangeText={setFirstName}
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Second name</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText }]}
                                    placeholder='Enter second name'
                                    placeholderTextColor={theme.inputText}
                                    value={secondName}
                                    onChangeText={setSecondName}
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Username</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText }]}
                                    placeholder='Enter username'
                                    placeholderTextColor={theme.inputText}
                                    value={username}
                                    onChangeText={setUsername}
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Date of birthday</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText }]}
                                    placeholder='DD.MM.YYYY'
                                    placeholderTextColor={theme.inputText}
                                    value={dateOfBirth}
                                    onChangeText={setDateOfBirth}
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Role</Text>
                                <TouchableOpacity
                                    onPress={() => setModalVisible(true)}
                                    style={[styles.roleField, { backgroundColor: theme.inputBackground }]}
                                >
                                    <Text style={[styles.roleText, { color: role ? theme.inputText : theme.inputText }]}>
                                        {role || 'Select role'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity activeOpacity={0.8} onPress={handleContinue}>
                            <View style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}>
                                <Text style={[styles.buttonText, { color: theme.buttonText }]}>Continue</Text>
                            </View>
                        </TouchableOpacity>

                        <Link href='/sign-in'>
                            <Text style={[styles.linkText, { color: theme.text }]}>I already have an account</Text>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal
                animationType='fade'
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.inputContainer, borderColor: theme.borderColor }]}>
                        <TouchableOpacity
                            onPress={() => {
                                setRole('USER');
                                setModalVisible(false);
                            }}
                        >
                            <Text style={[styles.modalOptionText, { color: theme.inputText }]}>User</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setRole('COACH');
                                setModalVisible(false);
                            }}
                        >
                            <Text style={[styles.modalOptionText, { color: theme.inputText }]}>Coach</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <ErrorPopup
                visible={isErrorPopupVisible}
                message={errorMessage}
                onClose={closeErrorPopup}
            />
        </View>
    );
}