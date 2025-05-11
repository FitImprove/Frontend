import { View, Text, TextInput, TouchableOpacity, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useNotification } from '@/src/contexts/Notification';
import { styles } from '@/src/styles/ProfileStyles';
import WaveBackground from '../src/components/WaveBackground';
import { useState, useEffect } from 'react';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { Switch, Modal } from 'react-native';
import BottomNavigation from '@/src/components/BottomNavigation';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, getRole, Role, setAuthToken } from '@/src/utils/api';
import ErrorPopup from '../src/components/ErrorPopup';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { encode } from 'base64-arraybuffer';
export default function ProfileScreen() {
    const { theme, toggleTheme } = useTheme();
    const { expoPushToken } = useNotification();
    const router = useRouter();
    const params = useLocalSearchParams();

    // Стани для полів профілю
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [username, setUsername] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [role, setRole] = useState<Role>('USER');
    const [selfInformation, setSelfInformation] = useState('');
    const [fields, setFields] = useState('');
    const [skills, setSkills] = useState('');
    const [selfIntroduction, setSelfIntroduction] = useState('');
    const [experience, setExperience] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [address, setAddress] = useState('');
    const [clients, setClients] = useState([]);
    const [mode, setMode] = useState('');
    const [notifications, setNotifications] = useState(false);
    const [fontSize, setFontSize] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorPopupVisible, setIsErrorPopupVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [imageDescriptors, setImageDescriptors] = useState([]);
    const [initialProfileImage, setInitialProfileImage] = useState<string | null>(null);
    // Стани для початкових значень
    const [initialSettings, setInitialSettings] = useState({
        theme: '',
        fontSize: '',
        notifications: false,
    });
    const [initialGym, setInitialGym] = useState({
        latitude: '',
        longitude: '',
        address: '',
    });
    const [initialUser, setInitialUser] = useState({
        name: '',
        surname: '',
        username: '',
        dateOfBirth: '',
        gender: '',
        selfInformation: '',
        fields: '',
        skills: '',
        selfIntroduction: '',
        experience: '',
    });

    // Доступні теми
    const themes = ['Purple', 'Black', 'High Contrast'];
    const fetchImageByPath = async (path: string): Promise<string> => {
        try {

            if(!isEditing) {

                const safeFileName = path.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const fileUri = `${FileSystem.cacheDirectory}${safeFileName}.png`;

                // Перевіряємо, чи файл вже існує
                const fileInfo = await FileSystem.getInfoAsync(fileUri);
                if (fileInfo.exists) {
                    return fileUri;
                }

                // Якщо не існує — завантажуємо
                const response = await api.get(`/images/get/${path}`, {
                    responseType: 'arraybuffer',
                });

                const base64String = encode(response.data);

                await FileSystem.writeAsStringAsync(fileUri, base64String, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                return fileUri;
            }
        } catch (error) {
            console.error('Помилка при обробці зображення:', error);
            throw error;
        }
    };

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    console.log('No token found, skipping user data load');

                    return;
                }
                const _storedRole = await getRole();
                if (_storedRole) {
                    setRole(_storedRole);
                } else {
                    setErrorMessage('Role not found. Please sign in again.');
                    setIsErrorPopupVisible(true);
                    return;
                }

                const response = await api.get('/users/user');
                const userData = response.data;

                // Заповнення станів лише якщо НЕ в режимі редагування
                if (!isEditing) {
                    setName(userData.name || '');
                    setSurname(userData.surname || '');
                    setUsername(userData.username || '');
                    setDateOfBirth(userData.dateOfBirth || '');
                    setGender(userData.gender ? userData.gender.charAt(0) + userData.gender.slice(1).toLowerCase() : '');
                    setSelfInformation(userData.selfInformation || '');

                    if (userData.role === 'COACH') {
                        setFields(userData.fields ? userData.fields.join(', ') : '');
                        setSkills(userData.skills ? userData.skills.join(', ') : '');
                        setSelfIntroduction(userData.selfIntroduction || '');
                        setExperience(userData.worksInFieldSince ? new Date(userData.worksInFieldSince).getFullYear().toString() : '');
                        setLatitude(userData.gym?.latitude || '');
                        setLongitude(userData.gym?.longitude || '');
                        setAddress(userData.gym?.address || '');
                        setClients(userData.clients || []);

                        // Зберігання початкових значень gym
                        setInitialGym({
                            latitude: userData.gym?.latitude || '',
                            longitude: userData.gym?.longitude || '',
                            address: userData.gym?.address || '',
                        });
                    }

                    if (userData.settings) {
                        setMode(userData.settings.theme ? userData.settings.theme.charAt(0) + userData.settings.theme.slice(1).toLowerCase() : 'Purple');
                        setNotifications(userData.settings.notifications || false);
                        setFontSize(userData.settings.fontSize ? userData.settings.fontSize.toString() : '12');

                        // Зберігання початкових значень settings
                        setInitialSettings({
                            theme: userData.settings.theme ? userData.settings.theme.charAt(0) + userData.settings.theme.slice(1).toLowerCase() : 'Purple',
                            fontSize: userData.settings.fontSize ? userData.settings.fontSize.toString() : '12',
                            notifications: userData.settings.notifications || false,
                        });
                    }

                    // Зберігання початкових значень user
                    setInitialUser({
                        name: userData.name || '',
                        surname: userData.surname || '',
                        username: userData.username || '',
                        dateOfBirth: userData.dateOfBirth || '',
                        gender: userData.gender ? userData.gender.charAt(0) + userData.gender.slice(1).toLowerCase() : '',
                        selfInformation: userData.selfInformation || '',
                        fields: userData.fields ? userData.fields.join(', ') : '',
                        skills: userData.skills ? userData.skills.join(', ') : '',
                        selfIntroduction: userData.selfIntroduction || '',
                        experience: userData.worksInFieldSince ? new Date(userData.worksInFieldSince).getFullYear().toString() : '',
                    });
                    const descriptorsResponse = await api.get('/images/descriptors');
                    const descriptorsData = descriptorsResponse.data;
                    setImageDescriptors(descriptorsData || []);


                    if (descriptorsData && descriptorsData.length > 0 && descriptorsData[0].path) {
                        const base64Image = await fetchImageByPath(descriptorsData[0].path);
                        setProfileImage(base64Image);
                    } else {
                        setProfileImage(null);
                    }
                }

                // Оновлення координат і адреси з параметрів
                if (params.latitude && params.longitude && params.address) {
                    setLatitude(params.latitude.toString());
                    setLongitude(params.longitude.toString());
                    setAddress(params.address.toString());
                }
            } catch (error) {
                console.error('Error loading user data or images:', error);
                if (error.response?.status === 401) {
                    setErrorMessage('Session expired. Please sign in again.');
                    router.push('/sign-in');
                } else if (error.response?.status === 403) {
                    setErrorMessage('Access denied.');
                } else if (error.response?.status === 404) {
                    setErrorMessage('User or images not found.');
                } else {
                    setErrorMessage('Failed to load user data or images. Please try again.');
                }
                setIsErrorPopupVisible(true);
            }
        };
        loadUserData();
    }, [params]);
    // Image picker handler
    const handleImagePick = async () => {
        console.log('handleImagePick викликано');

        // Перевірка дозволів для доступу до галереї
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            console.log('Дозвіл на доступ до галереї не надано');
            setErrorMessage('Дозвіл на доступ до галереї не надано');
            setIsErrorPopupVisible(true);
            return;
        }

        // Виклик пікера для вибору зображення
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // Тільки зображення
            quality: 1, // Максимальна якість
            allowsEditing: false, // Чи дозволити редагування (обрізку) зображення
        });

        console.log('Відповідь від ImagePicker:', result);

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const imageUri = result.assets[0].uri;
            console.log('Вибране зображення URI:', imageUri);
            setProfileImage(imageUri); // Встановлюємо локальний URI для попереднього перегляду
        } else {
            console.log('Вибір скасовано');
            setErrorMessage('Вибір зображення скасовано');
            setIsErrorPopupVisible(true);
        }
    };
    // Валідація полів
    const validateFields = () => {
        // Обов’язкові поля
        if (!name || name.length < 1 || name.length > 128 || !/^[a-zA-Zа-яА-ЯїЇіІєЄґҐ]+$/.test(name)) {
            setErrorMessage('Name must be 1-128 characters and contain only letters.');
            setIsErrorPopupVisible(true);
            return false;
        }
        if (!surname || surname.length < 1 || surname.length > 128 || !/^[a-zA-Zа-яА-ЯїЇіІєЄґҐ]+$/.test(surname)) {
            setErrorMessage('Surname must be 1-128 characters and contain only letters.');
            setIsErrorPopupVisible(true);
            return false;
        }
        if (!username || username.length < 3 || username.length > 128 || !/^[a-zA-Z0-9_]+$/.test(username)) {
            setErrorMessage('Username must be 3-128 characters and contain only letters, digits, or underscores.');
            setIsErrorPopupVisible(true);
            return false;
        }
        if (!dateOfBirth || !/^\d{2}\.\d{2}\.\d{4}$/.test(dateOfBirth)) {
            setErrorMessage('Date of birth must be in format DD.MM.YYYY.');
            setIsErrorPopupVisible(true);
            return false;
        }

        // Необов’язкові поля (перевіряються, якщо не порожні)
        if (gender && !['Male', 'Female'].includes(gender)) {
            setErrorMessage('Gender must be Male or Female.');
            setIsErrorPopupVisible(true);
            return false;
        }
        if (selfInformation && (selfInformation.length < 8 || selfInformation.length > 1024 || !/^[a-zA-Zа-яА-ЯїЇіІєЄґҐ\d\s.,#!?@(){}\[\]<>%&'*+_-]+$/.test(selfInformation))) {
            setErrorMessage('Self information must be 8-1024 characters and contain only letters, digits, and common punctuation.');
            setIsErrorPopupVisible(true);
            return false;
        }
        if (role.toLowerCase() === 'coach') {
            if (fields && fields.split(', ').some(field => field.length < 1)) {
                setErrorMessage('Each field must be non-empty.');
                setIsErrorPopupVisible(true);
                return false;
            }
            if (skills && skills.split(', ').some(skill => skill.length < 1)) {
                setErrorMessage('Each skill must be non-empty.');
                setIsErrorPopupVisible(true);
                return false;
            }
            if (selfIntroduction && (selfIntroduction.length < 8 || selfIntroduction.length > 1024)) {
                setErrorMessage('Self introduction must be 8-1024 characters.');
                setIsErrorPopupVisible(true);
                return false;
            }
            if (experience && !/^\d{4}$/.test(experience)) {
                setErrorMessage('Experience must be a valid year.');
                setIsErrorPopupVisible(true);
                return false;
            }
            if (!latitude || isNaN(parseFloat(latitude)) || parseFloat(latitude) < -90 || parseFloat(latitude) > 90) {
                setErrorMessage('Latitude must be a number between -90 and 90.');
                setIsErrorPopupVisible(true);
                return false;
            }
            if (!longitude || isNaN(parseFloat(longitude)) || parseFloat(longitude) < -180 || parseFloat(longitude) > 180) {
                setErrorMessage('Longitude must be a number between -180 and 180.');
                setIsErrorPopupVisible(true);
                return false;
            }
            if (!address || address.trim().length === 0) {
                setErrorMessage('Gym address cannot be empty.');
                setIsErrorPopupVisible(true);
                return false;
            }
        }
        if (!mode || !themes.includes(mode)) {
            setErrorMessage('Theme must be Purple, Black, or High Contrast.');
            setIsErrorPopupVisible(true);
            return false;
        }
        if (!fontSize || isNaN(parseInt(fontSize)) || parseInt(fontSize) < 8) {
            setErrorMessage('Font size must be a number greater than or equal to 8.');
            setIsErrorPopupVisible(true);
            return false;
        }
        return true;
    };

    // Збереження профілю
    const handleSaveProfile = async () => {
        console.log('handleSaveProfile called');
        if (!validateFields()) return;

        try {
            let hasChanges = false;
            if (profileImage && profileImage.startsWith('file://')) {
                // Видалення старого зображення, якщо воно єї
                if (imageDescriptors.length > 0) {
                    console.log(imageDescriptors[0].id);
                    await api.delete(`/images/del/${imageDescriptors[0].id}`);
                }

                const formData = new FormData();
                formData.append('file', {
                    uri: profileImage,
                    name: 'profile.png',
                    type: 'image/png',
                } as any);
            // , {
            //         headers: {
            //             'Content-Type': 'multipart/form-data',
            //         },
            //     }
                const response = await api.post(`/images/upload`, formData);

                const newImage = response.data; // PubImageDTO з id, userId, path
                console.log('Нове зображення:', newImage);
                // const fileUri = await fetchImageByPath(newImage.path);
                // setProfileImage(fileUri);
                setImageDescriptors([newImage]);
                hasChanges = true;
            }
            // Перевірка змін у профілі користувача
            const userPayload = {
                name,
                surname,
                username,
                dateOfBirth,
                gender: gender.toUpperCase() || null,
                selfInformation: selfInformation || null,
                fields: fields ? fields.split(', ').filter(f => f) : null,
                skills: skills ? skills.split(', ').filter(s => s) : null,
                selfIntroduction: selfIntroduction || null,
                worksInFieldSince: experience ? `${experience}-01-01` : null,
            };
            const userChanged =
                initialUser.name !== name ||
                initialUser.surname !== surname ||
                initialUser.username !== username ||
                initialUser.dateOfBirth !== dateOfBirth ||
                initialUser.gender !== gender ||
                initialUser.selfInformation !== selfInformation ||
                initialUser.fields !== fields ||
                initialUser.skills !== skills ||
                initialUser.selfIntroduction !== selfIntroduction ||
                initialUser.experience !== experience;

            if (userChanged) {
                console.log('User payload:', userPayload);
                await api.put('/users/update', userPayload);
                setInitialUser({
                    name,
                    surname,
                    username,
                    dateOfBirth,
                    gender,
                    selfInformation,
                    fields,
                    skills,
                    selfIntroduction,
                    experience,
                });
                hasChanges = true;
            }

            // Перевірка змін у налаштуваннях
            const settingsPayload = {
                theme: mode.toUpperCase(),
                fontSize: parseInt(fontSize),
                notifications,
            };
            const settingsChanged =
                initialSettings.theme !== mode ||
                initialSettings.fontSize !== fontSize ||
                initialSettings.notifications !== notifications;

            if (settingsChanged) {
                console.log('Settings payload:', settingsPayload);
                await api.put('/settings/update', settingsPayload);
                setInitialSettings({
                    theme: mode,
                    fontSize,
                    notifications,
                });
                hasChanges = true;
            }

            // Перевірка змін у залі (тільки для тренерів)
            if (role.toLowerCase() === 'coach') {
                const gymPayload = {
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    address,
                };
                const gymChanged =
                    initialGym.latitude !== latitude ||
                    initialGym.longitude !== longitude ||
                    initialGym.address !== address;

                if (gymChanged) {
                    console.log('Gym payload:', gymPayload);
                    await api.put('/gyms/update', gymPayload);
                    setInitialGym({
                        latitude,
                        longitude,
                        address,
                    });
                    hasChanges = true;
                }
            }
            //
            // Закоментований запит для нотифікацій
            if (expoPushToken) {
                console.log(expoPushToken);
                await api.put('/users/notifications', {
                    notificationsEnabled: notifications,
                    expoPushToken: notifications ? expoPushToken : null,
                });
            }

            if (hasChanges) {
                setIsEditing(false);
                await toggleTheme(mode.toLowerCase());
            } else {
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            if (error.response?.status === 401) {
                setErrorMessage('Session expired. Please sign in again.');
                router.push('/sign-in');
            } else if (error.response?.status === 400) {
                setErrorMessage(
                    error.response?.config?.url?.includes('/gym') ? 'Invalid gym data. Please check your inputs.' :
                        error.response?.config?.url?.includes('/users') ? 'Invalid user data. Please check your inputs.' :
                            'Invalid settings data. Please check your inputs.'
                );
            } else if (error.response?.status === 403) {
                setErrorMessage(
                    error.response?.config?.url?.includes('/gym') ? 'You are not authorized to update gym.' :
                        error.response?.config?.url?.includes('/users') ? 'You are not authorized to update user.' :
                            'You are not authorized to update settings.'
                );
            } else if (error.response?.status === 404) {
                setErrorMessage(
                    error.response?.config?.url?.includes('/gym') ? 'Coach or gym not found.' :
                        error.response?.config?.url?.includes('/users') ? 'User not found.' :
                            'Settings or user not found.'
                );
            } else {
                setErrorMessage('Failed to save profile. Please try again.');
            }
            setIsErrorPopupVisible(true);
        }
    };

    // Перемикання режиму редагування
    const handleEditProfile = () => {
        console.log('Entering edit mode');
        setIsEditing(true);
    };

    // Скасування редагування
    const handleCancelEdit = () => {
        console.log('Canceling edit mode');
        setIsEditing(false);
        const reloadUserData = async () => {
            try {
                const response = await api.get('/users/user');
                const userData = response.data;
                setName(userData.name || '');
                setSurname(userData.surname || '');
                setUsername(userData.username || '');
                setDateOfBirth(userData.dateOfBirth || '');
                setGender(userData.gender ? userData.gender.charAt(0) + userData.gender.slice(1).toLowerCase() : '');
                setSelfInformation(userData.selfInformation || '');

                if (userData.role === 'COACH') {
                    setFields(userData.fields ? userData.fields.join(', ') : '');
                    setSkills(userData.skills ? userData.skills.join(', ') : '');
                    setSelfIntroduction(userData.selfIntroduction || '');
                    setExperience(userData.worksInFieldSince ? new Date(userData.worksInFieldSince).getFullYear().toString() : '');
                    setLatitude(userData.gym?.latitude || '');
                    setLongitude(userData.gym?.longitude || '');
                    setAddress(userData.gym?.address || '');
                    setClients(userData.clients || []);

                    // Оновлення початкових значень gym
                    setInitialGym({
                        latitude: userData.gym?.latitude || '',
                        longitude: userData.gym?.longitude || '',
                        address: userData.gym?.address || '',
                    });
                }

                if (userData.settings) {
                    setMode(userData.settings.theme ? userData.settings.theme.charAt(0) + userData.settings.theme.slice(1).toLowerCase() : 'Purple');
                    setNotifications(userData.settings.notifications || false);
                    setFontSize(userData.settings.fontSize ? userData.settings.fontSize.toString() : '12');

                    // Оновлення початкових значень settings
                    setInitialSettings({
                        theme: userData.settings.theme ? userData.settings.theme.charAt(0) + userData.settings.theme.slice(1).toLowerCase() : 'Purple',
                        fontSize: userData.settings.fontSize ? userData.settings.fontSize.toString() : '12',
                        notifications: userData.settings.notifications || false,
                    });
                }
                const descriptorsResponse = await api.get('/images/descriptors');
                const descriptorsData = descriptorsResponse.data;
                setImageDescriptors(descriptorsData || []);

                if (descriptorsData && descriptorsData.length > 0 && descriptorsData[0].path) {
                    const base64Image = await fetchImageByPath(descriptorsData[0].path);
                    setProfileImage(base64Image);
                } else {
                    setProfileImage(null);
                }
                // Оновлення початкових значень user
                setInitialUser({
                    name: userData.name || '',
                    surname: userData.surname || '',
                    username: userData.username || '',
                    dateOfBirth: userData.dateOfBirth || '',
                    gender: userData.gender ? userData.gender.charAt(0) + userData.gender.slice(1).toLowerCase() : '',
                    selfInformation: userData.selfInformation || '',
                    fields: userData.fields ? userData.fields.join(', ') : '',
                    skills: userData.skills ? userData.skills.join(', ') : '',
                    selfIntroduction: userData.selfIntroduction || '',
                    experience: userData.worksInFieldSince ? new Date(userData.worksInFieldSince).getFullYear().toString() : '',
                });
            } catch (error) {
                console.error('Error reloading user data:', error);
                setErrorMessage('Failed to reload user data.');
                setIsErrorPopupVisible(true);
            }
        };
        reloadUserData();
    };

    // Функція для повернення назад
    const handleGoBack = () => {
        console.log('Going back');
        router.back();
    };

    const goToGym = () => {
        console.log('Navigating to gym, isEditing:', isEditing);
        router.push({
            pathname: '/location-gym',
            params: {
                latitude: latitude || '',
                longitude: longitude || '',
                address: address || '',
            },
        });
    };

    const closeErrorPopup = () => {
        setIsErrorPopupVisible(false);
        setErrorMessage('');
    };

    async function handleLogout() {
        try {
            await setAuthToken('');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('role');
            router.push('/');
        } catch (error) {
            console.error('Error during logout:', error);
            setErrorMessage('Failed to logout. Please try again.');
            setIsErrorPopupVisible(true);
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
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
                        paddingBottom: hp('12%'),
                    }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.innerContainer}>
                        {/* Заголовок із стрілкою назад і кнопкою */}
                        <View style={styles.textContainer}>
                            <TouchableOpacity onPress={handleGoBack}>
                                <Text style={[styles.text, { color: theme.accent || '#ff00cc', fontSize: wp('6%') }]}>←</Text>
                            </TouchableOpacity>
                            {isEditing ? (
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity onPress={handleSaveProfile}>
                                        <View style={[styles.editButton, { borderColor: theme.borderColor }]}>
                                            <Text style={[styles.editButtonText, { color: theme.text }]}>Save</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleCancelEdit}>
                                        <View style={[styles.editButton, { borderColor: theme.borderColor, marginLeft: wp('2%') }]}>
                                            <Text style={[styles.editButtonText, { color: theme.text }]}>Cancel</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity onPress={handleEditProfile}>
                                    <View style={[styles.editButton, { borderColor: theme.borderColor }]}>
                                        <Text style={[styles.editButtonText, { color: theme.text }]}>Edit profile</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Іконка профілю */}
                        <View style={styles.profileIconContainer}>
                            {profileImage ? (
                                <Image
                                    source={{ uri: profileImage }}
                                    style={[styles.profileIcon, { borderColor: theme.borderColor }]}
                                />
                            ) : (
                                <View style={[styles.profileIcon, { borderColor: theme.borderColor }]}>
                                    <Text style={{ fontSize: wp('10%'), color: theme.text }}>👤</Text>
                                </View>
                            )}
                            {isEditing && (
                                <TouchableOpacity
                                    onPress={handleImagePick}
                                    style={{
                                        marginTop: hp('1%'),
                                        padding: wp('2%'),
                                        backgroundColor: theme.buttonBackground,
                                        borderRadius: 5,
                                    }}
                                >
                                    <Text style={{ color: theme.text, fontSize: wp('4%') }}>Upload Image</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        {/* Поля профілю */}
                        <View style={[styles.inputContainer, { backgroundColor: theme.inputContainer, borderColor: theme.borderColor }]}>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Name</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter your name"
                                    placeholderTextColor={theme.inputText}
                                    editable={isEditing}
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Surname</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
                                    value={surname}
                                    onChangeText={setSurname}
                                    placeholder="Enter your surname"
                                    placeholderTextColor={theme.inputText}
                                    editable={isEditing}
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Username</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Enter your username"
                                    placeholderTextColor={theme.inputText}
                                    editable={isEditing}
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Date of birthday</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
                                    value={dateOfBirth}
                                    onChangeText={setDateOfBirth}
                                    placeholder="DD.MM.YYYY"
                                    placeholderTextColor={theme.inputText}
                                    editable={isEditing}
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Gender</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
                                    value={gender}
                                    onChangeText={setGender}
                                    placeholder="Male or Female"
                                    placeholderTextColor={theme.inputText}
                                    editable={isEditing}
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Role</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
                                    value={role}
                                    onChangeText={setRole}
                                    placeholder="Your role"
                                    placeholderTextColor={theme.inputText}
                                    editable={false}
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Self Information</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
                                    value={selfInformation}
                                    onChangeText={setSelfInformation}
                                    placeholder="Enter your self information"
                                    placeholderTextColor={theme.inputText}
                                    editable={isEditing}
                                />
                            </View>

                            {/* Додаткові поля для тренерів */}
                            {role === 'COACH' && (
                                <>
                                    <View style={styles.inputWrapper}>
                                        <Text style={[styles.label, { color: theme.textOnElement }]}>Fields</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
                                            value={fields}
                                            onChangeText={setFields}
                                            placeholder="Enter fields (comma-separated)"
                                            placeholderTextColor={theme.inputText}
                                            editable={isEditing}
                                        />
                                    </View>
                                    <View style={styles.inputWrapper}>
                                        <Text style={[styles.label, { color: theme.textOnElement }]}>Skills</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
                                            value={skills}
                                            onChangeText={setSkills}
                                            placeholder="Enter skills (comma-separated)"
                                            placeholderTextColor={theme.inputText}
                                            editable={isEditing}
                                        />
                                    </View>
                                    <View style={styles.inputWrapper}>
                                        <Text style={[styles.label, { color: theme.textOnElement }]}>Self Introduction</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
                                            value={selfIntroduction}
                                            onChangeText={setSelfIntroduction}
                                            placeholder="Enter your self introduction"
                                            placeholderTextColor={theme.inputText}
                                            editable={isEditing}
                                        />
                                    </View>
                                    <View style={styles.inputWrapper}>
                                        <Text style={[styles.label, { color: theme.textOnElement }]}>Experience</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
                                            value={experience}
                                            onChangeText={setExperience}
                                            placeholder="Enter year (e.g., 2020)"
                                            placeholderTextColor={theme.inputText}
                                            editable={isEditing}
                                        />
                                    </View>
                                    <View style={styles.inputWrapper}>
                                        <Text style={[styles.label, { color: theme.textOnElement }]}>Gym</Text>
                                        <TouchableOpacity
                                            onPress={isEditing ? goToGym : () => {}}
                                            style={{ width: '100%' }}
                                        >
                                            <TextInput
                                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}
                                                value={address}
                                                placeholder="Enter your gym"
                                                placeholderTextColor={theme.inputText}
                                                editable={false}
                                                pointerEvents="none"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>

                        {/* Контейнер із клієнтами (тільки для тренерів, не редагується) */}
                        {role === 'COACH' && (
                            <View style={[styles.inputContainer, { backgroundColor: theme.inputContainer, borderColor: theme.borderColor, marginTop: hp('2%') }]}>
                                <Text style={[styles.label, { color: theme.text, marginBottom: hp('1%') }]}>Clients</Text>
                                <View style={styles.clientsWrapper}>
                                    {clients.length > 0 ? (
                                        clients.map((client, index) => (
                                            <View key={index} style={[styles.clientBox, { backgroundColor: theme.inputBackground, borderColor: theme.borderColor }]}>
                                                <Text style={[styles.clientText, { color: theme.inputText }]}>{client}</Text>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={[styles.clientText, { color: theme.inputText }]}>No clients assigned</Text>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Розділ налаштувань */}
                        <View style={[styles.settingsContainer, { backgroundColor: theme.inputContainer, borderColor: theme.borderColor, marginTop: hp('2%') }]}>
                            <Text style={[styles.label, { color: theme.text, marginBottom: hp('1%') }]}>Settings</Text>
                            <View style={styles.settingsWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Mode</Text>
                                <TouchableOpacity
                                    onPress={() => isEditing && setIsThemeModalVisible(true)}
                                    style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, width: wp('40%'), justifyContent: 'center' }]}
                                >
                                    <Text style={{ color: theme.inputText }}>{mode || 'Select mode'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.settingsWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Notifications</Text>
                                <Switch
                                    value={notifications}
                                    onValueChange={setNotifications}
                                    trackColor={{ false: '#767577', true: theme.buttonBackground }}
                                    thumbColor={notifications ? '#f4f3f4' : '#f4f3f4'}
                                    disabled={!isEditing}
                                />
                            </View>
                            <View style={styles.settingsWrapper}>
                                <Text style={[styles.label, { color: theme.textOnElement }]}>Font size</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder, width: wp('40%') }]}
                                    value={fontSize}
                                    onChangeText={setFontSize}
                                    placeholder="Enter font size"
                                    placeholderTextColor={theme.inputText}
                                    keyboardType="numeric"
                                    editable={isEditing}
                                />
                            </View>
                        </View>
                        <TouchableOpacity onPress={handleLogout}>
                            <View style={[styles.deleteButton, { borderColor: theme.borderColor }]}>
                                <Text style={[styles.editButtonText, { color: theme.text }]}>Logout</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <BottomNavigation />
            </KeyboardAvoidingView>

            {/* Модальне вікно для вибору теми */}
            <Modal
                visible={isThemeModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsThemeModalVisible(false)}
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}>
                    <View style={{
                        backgroundColor: theme.inputContainer,
                        borderRadius: 10,
                        padding: wp('5%'),
                        width: wp('80%'),
                    }}>
                        <Text style={[styles.label, { color: theme.text, marginBottom: hp('2%') }]}>Select Theme</Text>
                        {themes.map((themeOption) => (
                            <TouchableOpacity
                                key={themeOption}
                                onPress={() => {
                                    setMode(themeOption);
                                    setIsThemeModalVisible(false);
                                }}
                                style={{
                                    paddingVertical: hp('1%'),
                                    marginVertical: hp('0.5%'),
                                }}
                            >
                                <Text style={{ color: theme.text, fontSize: wp('4%') }}>{themeOption}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            onPress={() => setIsThemeModalVisible(false)}
                            style={{
                                marginTop: hp('2%'),
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ color: theme.buttonBackground, fontSize: wp('4%') }}>Cancel</Text>
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