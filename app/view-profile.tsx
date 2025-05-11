import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { styles } from '@/src/styles/ProfileStyles';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { api } from '@/src/utils/api';
import ErrorPopup from '../src/components/ErrorPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { encode } from 'base64-arraybuffer';

interface UserProfile {
    id: number;
    name: string;
    surname: string;
    username: string;
    dateOfBirth: string;
    gender: string;
    selfInformation: string;
    role: 'USER' | 'COACH';
    fields?: string[];
    skills?: string[];
    selfIntroduction?: string;
    worksInFieldSince?: string;
    gym?: {
        latitude: string;
        longitude: string;
        address: string;
    };
}

export default function ProfileViewScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { userId } = useLocalSearchParams();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [avatar, setAvatar] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorPopupVisible, setIsErrorPopupVisible] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState<'USER' | 'COACH' | null>(null);
    const [chatExists, setChatExists] = useState<boolean>(false);

    const fetchImageByPath = async (path: string): Promise<string> => {
        try {
            const safeFileName = path.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const fileUri = `${FileSystem.cacheDirectory}${safeFileName}.png`;
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (fileInfo.exists) {
                return fileUri;
            }
            const response = await api.get(`/images/get/${path}`, {
                responseType: 'arraybuffer',
            });
            const base64String = encode(response.data);
            await FileSystem.writeAsStringAsync(fileUri, base64String, {
                encoding: FileSystem.EncodingType.Base64,
            });
            return fileUri;
        } catch (error) {
            console.error('Error fetching image:', error);
            throw error;
        }
    };

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    setErrorMessage('Session expired. Please sign in again.');
                    setIsErrorPopupVisible(true);
                    router.push('/sign-in');
                    return;
                }

                const storedRole = await AsyncStorage.getItem('role');
                if (!storedRole) {
                    setErrorMessage('Role not found. Please sign in again.');
                    setIsErrorPopupVisible(true);
                    router.push('/sign-in');
                    return;
                }
                setCurrentUserRole(storedRole as 'USER' | 'COACH');

                const parsedUserId = Array.isArray(userId) ? userId[0] : userId;
                const response = await api.get(`/users/${parsedUserId}`);
                const userData = response.data;
                console.log(userData);
                setProfile(userData);

                if (storedRole === 'USER' && userData.role === 'COACH') {
                    try {
                        const chatExistsResponse = await api.get('/chats/exists', {
                            params: { coachId: parsedUserId }
                        });
                        setChatExists(chatExistsResponse.data);
                    } catch (error) {
                        console.error('Error checking chat existence:', error);
                        setChatExists(false);
                    }
                }

                try {
                    const descriptorsResponse = await api.get(`/images/descriptors/${parsedUserId}`);
                    const descriptorsData = descriptorsResponse.data;
                    if (descriptorsData && descriptorsData.length > 0 && descriptorsData[0].path) {
                        const base64Image = await fetchImageByPath(descriptorsData[0].path);
                        setAvatar(base64Image);
                    }
                } catch (error) {
                    console.error('Error fetching avatar:', error);
                    setAvatar(null);
                }
            } catch (error) {
                console.error('Error loading profile:', error);
                if (error.response?.status === 401) {
                    setErrorMessage('Session expired. Please sign in again.');
                    router.push('/sign-in');
                } else if (error.response?.status === 403) {
                    setErrorMessage('Access denied.');
                } else if (error.response?.status === 404) {
                    setErrorMessage('User not found.');
                } else {
                    setErrorMessage('Failed to load profile. Please try again.');
                }
                setIsErrorPopupVisible(true);
            }
        };

        loadProfile();
    }, [userId]);

    const handleChooseAsCoach = async () => {
        try {
            console.log(profile?.id);
            const response = await api.post('/chats/create', {}, {
                params: { coachId: profile?.id }
            });
            const chatId = response.data.id;
            router.push({
                pathname: '/chat',
                params: { chatId },
            });
            setErrorMessage('Coach selected successfully!');
            setIsErrorPopupVisible(true);
        } catch (error) {
            console.error('Error choosing coach:', error);
            if (error.response?.status === 401) {
                setErrorMessage('Session expired. Please sign in again.');
                router.push('/sign-in');
            } else if (error.response?.status === 403) {
                setErrorMessage('Access denied.');
            } else if (error.response?.status === 404) {
                setErrorMessage('Coach not found.');
            } else {
                setErrorMessage('Failed to choose coach. Please try again.');
            }
            setIsErrorPopupVisible(true);
        }
    };

    const handleSendMessage = async () => {
        try {
            const params = currentUserRole === 'COACH'
                ? { userId: profile?.id }
                : { coachId: profile?.id };

            const chatExistsResponse = await api.get('/chats/exists', { params });
            const chatExists = chatExistsResponse.data;

            let chatId;
            if (!chatExists) {
                const createResponse = await api.post('/chats/create', {}, {
                    params: { coachId: profile?.id }
                });
                chatId = createResponse.data.id;
            } else {
                const endpoint = currentUserRole === 'COACH' ? '/chats/coach' : '/chats/user';
                const chatsResponse = await api.get(endpoint);
                const chats = chatsResponse.data;

                let existingChat;
                if (currentUserRole === 'COACH') {
                    existingChat = chats.find((chat: any) => chat.regularUser.id === profile?.id);
                } else {
                    existingChat = chats.find((chat: any) => chat.coach.id === profile?.id);
                }

                if (!existingChat) {
                    throw new Error('Chat not found despite existing.');
                }
                chatId = existingChat.id;
            }

            router.push({
                pathname: '/chat',
                params: { chatId },
            });
        } catch (error) {
            console.error('Error creating or navigating to chat:', error);
            if (error.response?.status === 401) {
                setErrorMessage('Session expired. Please sign in again.');
                router.push('/sign-in');
            } else if (error.response?.status === 403) {
                setErrorMessage('Access denied.');
            } else if (error.response?.status === 404) {
                setErrorMessage('User not found.');
            } else {
                setErrorMessage('Failed to create or navigate to chat. Please try again.');
            }
            setIsErrorPopupVisible(true);
        }
    };

    const handleViewGym = () => {
        if (profile?.gym?.address && profile.gym.address.trim() !== '') {
            router.push({
                pathname: '/view-gym',
                params: {
                    gym: JSON.stringify(profile.gym),
                },
            });
        } else {
            setErrorMessage('Gym information is not available.');
            setIsErrorPopupVisible(true);
        }
    };

    const closeErrorPopup = () => {
        setIsErrorPopupVisible(false);
        setErrorMessage('');
    };

    if (!profile) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.text, fontSize: wp('5%') }}>Loading...</Text>
                <ErrorPopup visible={isErrorPopupVisible} message={errorMessage} onClose={closeErrorPopup} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background, flex: 1 }]}>
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

                    <View style={styles.textContainer}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={[styles.text, { color: theme.accent || '#ff00cc', fontSize: wp('6%') }]}>←</Text>
                        </TouchableOpacity>
                        <Text style={[styles.headerText, { color: theme.text, fontSize: wp('5%') }]}>
                            {`${profile.name} ${profile.surname}`.trim()}'s Profile
                        </Text>
                    </View>


                    <View style={styles.profileIconContainer}>
                        {avatar ? (
                            <Image
                                source={{ uri: avatar }}
                                style={[styles.profileIcon, { borderColor: theme.borderColor }]}
                            />
                        ) : (
                            <View style={[styles.profileIcon, { borderColor: theme.borderColor }]}>
                                <Text style={{ fontSize: wp('10%'), color: theme.text }}>👤</Text>
                            </View>
                        )}
                    </View>


                    <View style={[styles.inputContainer, { backgroundColor: theme.inputContainer, borderColor: theme.borderColor }]}>
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.label, { color: theme.textOnElement }]}>Name</Text>
                            <Text style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}>
                                {profile.name}
                            </Text>
                        </View>
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.label, { color: theme.textOnElement }]}>Surname</Text>
                            <Text style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}>
                                {profile.surname}
                            </Text>
                        </View>
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.label, { color: theme.textOnElement }]}>Username</Text>
                            <Text style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}>
                                {profile.username}
                            </Text>
                        </View>
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.label, { color: theme.textOnElement }]}>Date of Birth</Text>
                            <Text style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}>
                                {profile.dateOfBirth}
                            </Text>
                        </View>
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.label, { color: theme.textOnElement }]}>Gender</Text>
                            <Text style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}>
                                {profile.gender ? profile.gender.charAt(0) + profile.gender.slice(1).toLowerCase() : ''}
                            </Text>
                        </View>
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.label, { color: theme.textOnElement }]}>Role</Text>
                            <Text style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}>
                                {profile.role}
                            </Text>
                        </View>
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.label, { color: theme.textOnElement }]}>Self Information</Text>
                            <Text style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}>
                                {profile.selfInformation || 'Not provided'}
                            </Text>
                        </View>


                        {profile.role === 'COACH' && (
                            <>
                                <View style={styles.inputWrapper}>
                                    <Text style={[styles.label, { color: theme.textOnElement }]}>Fields</Text>
                                    <Text style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}>
                                        {profile.fields ? profile.fields.join(', ') : 'Not provided'}
                                    </Text>
                                </View>
                                <View style={styles.inputWrapper}>
                                    <Text style={[styles.label, { color: theme.textOnElement }]}>Skills</Text>
                                    <Text style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}>
                                        {profile.skills ? profile.skills.join(', ') : 'Not provided'}
                                    </Text>
                                </View>
                                <View style={styles.inputWrapper}>
                                    <Text style={[styles.label, { color: theme.textOnElement }]}>Self Introduction</Text>
                                    <Text style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}>
                                        {profile.selfIntroduction || 'Not provided'}
                                    </Text>
                                </View>
                                <View style={styles.inputWrapper}>
                                    <Text style={[styles.label, { color: theme.textOnElement }]}>Experience</Text>
                                    <Text style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText, borderColor: theme.inputBorder }]}>
                                        {profile.worksInFieldSince ? new Date(profile.worksInFieldSince).getFullYear().toString() : 'Not provided'}
                                    </Text>
                                </View>
                                <View style={styles.inputWrapper}>
                                    <Text style={[styles.label, { color: theme.textOnElement }]}>Gym</Text>
                                    <TouchableOpacity onPress={handleViewGym} disabled={!profile.gym?.address || profile.gym.address.trim() === ''}>
                                        <Text
                                            style={[
                                                styles.input,
                                                {
                                                    backgroundColor: theme.inputBackground,
                                                    color: theme.inputText,
                                                    borderColor: theme.inputBorder,
                                                    opacity: !profile.gym?.address || profile.gym.address.trim() === '' ? 0.5 : 1,
                                                },
                                            ]}
                                        >
                                            {profile.gym?.address || 'Not provided'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>


                    {currentUserRole === 'USER' && profile.role === 'COACH' && !chatExists && (
                        <TouchableOpacity onPress={handleChooseAsCoach}>
                            <View style={[styles.editButton, { borderColor: theme.borderColor, marginTop: hp('2%') }]}>
                                <Text style={[styles.editButtonText, { color: theme.text }]}>Choose as Coach</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    {((currentUserRole === 'USER' && profile.role === 'COACH' && chatExists) || (currentUserRole === 'COACH' && profile.role === 'USER')) && (
                        <TouchableOpacity onPress={handleSendMessage}>
                            <View style={[styles.editButton, { borderColor: theme.borderColor, marginTop: hp('2%') }]}>
                                <Text style={[styles.editButtonText, { color: theme.text }]}>Send Message</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            <ErrorPopup visible={isErrorPopupVisible} message={errorMessage} onClose={closeErrorPopup} />
        </View>
    );
}