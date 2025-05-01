import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { styles } from '@/src/styles/SignUpStyles';
import WaveBackground from '../src/components/WaveBackground';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';


type Role = 'USER' | 'COACH';

export default function SignUpScreen() {
    const { theme } = useTheme();

    const [firstName, setFirstName] = useState('');
    const [secondName, setSecondName] = useState('');
    const [username, setUsername] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [role, setRole] = useState<Role | null>(null);

    const [errors, setErrors] = useState({
        firstName: '',
        secondName: '',
        username: '',
        dateOfBirth: '',
        role: '',
    });

    const [modalVisible, setModalVisible] = useState(false);

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            firstName: '',
            secondName: '',
            username: '',
            dateOfBirth: '',
            role: '',
        };

        if (
            !firstName ||
            firstName.length < 1 ||
            firstName.length > 128 ||
            !/^[a-zA-Z\u00C0-\u1EF9]+$/u.test(firstName)
        ) {
            newErrors.firstName = 'First name must be 1-128 characters long and contain only letters';
            isValid = false;
        }

        if (
            !secondName ||
            secondName.length < 1 ||
            secondName.length > 128 ||
            !/^[a-zA-Z\u00C0-\u1EF9]+$/u.test(secondName)
        ) {
            newErrors.secondName = 'Second name must be 1-128 characters long and contain only letters';
            isValid = false;
        }

        if (
            !username ||
            username.length < 3 ||
            username.length > 128 ||
            !/^[a-zA-Z0-9_]+$/.test(username)
        ) {
            newErrors.username = 'Username must be 3-128 characters long and contain only English letters, digits, and _';
            isValid = false;
        }

        if (!dateOfBirth) {
            newErrors.dateOfBirth = 'Date of birth must be in format DD.MM.YYYY and be a valid date';
            isValid = false;
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
                newErrors.dateOfBirth = 'Date of birth must be in format DD.MM.YYYY and be a valid date';
                isValid = false;
            }
        }

        if (!role) {
            newErrors.role = 'Please select a role';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleContinue = () => {
        if (validateForm()) {
            router.push({
                pathname: '/sign-up-2',
                params: { firstName, secondName, username, dateOfBirth, role },
            });
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
                                <Text style={[styles.label, { color: theme.textOnElement }]}>First name</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText }]}
                                    placeholder="Enter first name"
                                    placeholderTextColor={theme.inputText}
                                    value={firstName}
                                    onChangeText={(text) => {
                                        setFirstName(text);
                                        setErrors((prev) => ({ ...prev, firstName: '' }));
                                    }}
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Second name</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText }]}
                                    placeholder="Enter second name"
                                    placeholderTextColor={theme.inputText}
                                    value={secondName}
                                    onChangeText={(text) => {
                                        setSecondName(text);
                                        setErrors((prev) => ({ ...prev, secondName: '' }));
                                    }}
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Username</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText }]}
                                    placeholder="Enter username"
                                    placeholderTextColor={theme.inputText}
                                    value={username}
                                    onChangeText={(text) => {
                                        setUsername(text);
                                        setErrors((prev) => ({ ...prev, username: '' }));
                                    }}
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Date of birthday</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText }]}
                                    placeholder="DD.MM.YYYY"
                                    placeholderTextColor={theme.inputText}
                                    value={dateOfBirth}
                                    onChangeText={(text) => {
                                        setDateOfBirth(text);
                                        setErrors((prev) => ({ ...prev, dateOfBirth: '' }));
                                    }}
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

                        {Object.values(errors).some((error) => error) && (
                            <View style={{ marginVertical: hp('1%'), alignItems: 'center' }}>
                                {errors.firstName ? (
                                    <Text style={{ color: 'red', fontSize: wp('3%') }}>{errors.firstName}</Text>
                                ) : errors.secondName ? (
                                    <Text style={{ color: 'red', fontSize: wp('3%') }}>{errors.secondName}</Text>
                                ) : errors.username ? (
                                    <Text style={{ color: 'red', fontSize: wp('3%') }}>{errors.username}</Text>
                                ) : errors.dateOfBirth ? (
                                    <Text style={{ color: 'red', fontSize: wp('3%') }}>{errors.dateOfBirth}</Text>
                                ) : errors.role ? (
                                    <Text style={{ color: 'red', fontSize: wp('3%') }}>{errors.role}</Text>
                                ) : null}
                            </View>
                        )}

                        <TouchableOpacity activeOpacity={0.8} onPress={handleContinue}>
                            <View style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}>
                                <Text style={[styles.buttonText, { color: theme.buttonText }]}>Continue</Text>
                            </View>
                        </TouchableOpacity>

                        <Link href="/sign-in">
                            <Text style={[styles.linkText, { color: theme.text }]}>I already have an account</Text>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.inputContainer, borderColor: theme.borderColor }]}>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => {
                                setRole('USER');
                                setErrors((prev) => ({ ...prev, role: '' }));
                                setModalVisible(false);
                            }}
                        >
                            <Text style={[styles.modalOptionText, { color: theme.inputText }]}>User</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => {
                                setRole('COACH');
                                setErrors((prev) => ({ ...prev, role: '' }));
                                setModalVisible(false);
                            }}
                        >
                            <Text style={[styles.modalOptionText, { color: theme.inputText }]}>Coach</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}