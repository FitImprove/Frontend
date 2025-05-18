import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Dimensions } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { getStyles } from '@/src/styles/ChatsStyles';
import { router, useRouter } from 'expo-router';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { api, getRole, Role } from '@/src/utils/api';
import BottomNavigation from '@/src/components/BottomNavigation';
import ErrorPopup from '../src/components/ErrorPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import * as FileSystem from "expo-file-system";
import { encode } from "base64-arraybuffer";
import {AxiosError} from "axios";


const { width } = Dimensions.get('window');
const isTablet = width >= 768;
/**
 * Represents a single message in a chat.
 * @property content - The text content of the message.
 * @property sentAt - The ISO string timestamp when the message was sent.
 */
export interface Message {
    content: string;
    sentAt: string;
}

/**
 * Represents a user participating in a chat.
 * @property id - Unique identifier of the user.
 * @property name - First name of the user.
 * @property surname - Last name (surname) of the user.
 */
export interface User {
    id: number;
    name: string;
    surname: string;
}

/**
 * Represents a chat conversation between a coach and a regular user.
 * @property id - Unique chat identifier.
 * @property coach - The coach participant (nullable).
 * @property regularUser - The regular user participant (nullable).
 * @property messages - List of messages exchanged in the chat.
 * @property createdAt - Timestamp when the chat was created.
 * @property updatedAt - Timestamp of the last update in the chat.
 * @property avatar - URI or local path to the participant's avatar image (nullable).
 */
export interface Chat {
    id: number;
    coach: User | null;
    regularUser: User | null;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
    avatar: string | null;
}

/**
 * ChatsScreen component displays a list of chat conversations for the current user or coach.
 *
 * @remarks
 * - Fetches chats from the backend based on user role (coach or regular user).
 * - Loads and caches participant avatars locally using Expo FileSystem to optimize performance.
 * - Handles role retrieval and session validation with redirects on unauthorized access.
 * - Uses React Navigation's useRouter for navigation and manages theme styling with a custom ThemeContext.
 * - Displays error popups on failures and allows retry or navigation to sign-in/home screens.
 * - Supports responsive design for tablets and phones.
 * - Utilizes useFocusEffect to refresh chats on screen focus.
 *
 * @returns {JSX.Element} Rendered list of chat items with participant avatars, last message previews, and navigation handlers.
 */
export default function ChatsScreen() {
    const { theme } = useTheme();
    const styles = getStyles(theme, isTablet);
    const router = useRouter();
    const [chats, setChats] = useState<Chat[]>([]);
    const [role, setRole] = useState<Role | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorPopupVisible, setIsErrorPopupVisible] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [imageDescriptors, setImageDescriptors] = useState([]);
    const [avatarCache, setAvatarCache] = useState<{ [key: number]: string | null }>({});

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

    const fetchAvatar = async (userId: number): Promise<string | null> => {
        if (avatarCache[userId]) {
            return avatarCache[userId];
        }
        try {
            const response = await api.get(`/images/descriptors/${userId}`);
            const descriptorsData = response.data;
            if (descriptorsData && descriptorsData.length > 0 && descriptorsData[0].path) {
                const base64Image = await fetchImageByPath(descriptorsData[0].path);
                setAvatarCache((prev) => ({ ...prev, [userId]: base64Image }));
                return base64Image;
            }
            setAvatarCache((prev) => ({ ...prev, [userId]: null }));
            return null;
        } catch (error) {
            console.error(`Error fetching avatar for user ${userId}:`, error);
            setAvatarCache((prev) => ({ ...prev, [userId]: null }));
            return null;
        }
    };

    useFocusEffect(
        useCallback(() => {
            const loadChats = async () => {
                try {
                    const storedRole = await getRole();
                    if (!storedRole) {
                        setErrorMessage('Role not found. Please sign in again.');
                        setIsErrorPopupVisible(true);
                        router.push('/sign-in');
                        return;
                    }
                    setRole(storedRole);

                    const endpoint = storedRole === 'COACH' ? '/chats/coach' : '/chats/user';
                    const response = await api.get(endpoint);
                    console.log(response.data);
                    const chatData = response.data || [];

                    const updatedChats = await Promise.all(
                        chatData.map(async (chat: Chat) => {
                            const participantId = storedRole === 'COACH' ? chat.regularUser?.id : chat.coach?.id;
                            const avatar = participantId ? await fetchAvatar(participantId) : null;
                            return { ...chat, avatar };
                        })
                    );

                    setChats(updatedChats);
                } catch (error) {
                    const axErr = error as AxiosError;
                    console.error('Error loading chats:', axErr);
                    if (axErr.response?.status === 401) {
                        setErrorMessage('Session expired. Please sign in again.');
                        router.push('/sign-in');
                    } else if (axErr.response?.status === 403) {
                        setErrorMessage('Access denied.');
                    } else if (axErr.response?.status === 404) {
                        setErrorMessage('Chats not found.');
                    } else {
                        setErrorMessage('Failed to load chats. Please try again.');
                        router.push("/home");
                    }
                    setIsErrorPopupVisible(true);
                }
            };

            loadChats();
        }, [])
    );

    const handleChatPress = (chatId: number) => {
        router.push({
            pathname: `/chat`,
            params: { chatId },
        });
    };

    const closeErrorPopup = () => {
        setIsErrorPopupVisible(false);
        setErrorMessage('');
    };

    const getParticipantName = (chat: Chat) => {
        if (role === 'COACH') {
            return `${chat.regularUser?.name || 'Unknown'} ${chat.regularUser?.surname || ''}`.trim();
        } else {
            return `${chat.coach?.name || 'Unknown'} ${chat.coach?.surname || ''}`.trim();
        }
    };

    const getLastMessageInfo = (chat: Chat) => {
        const messages = chat.messages || [];
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        return {
            text: lastMessage?.content || 'No messages yet',
            time: lastMessage?.sentAt ? new Date(lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        };
    };

    const renderChatItem = ({ item }: { item: Chat }) => (
        <TouchableOpacity
            onPress={() => handleChatPress(item.id)}
            style={[styles.chatCard, { backgroundColor: theme.inputContainer, borderColor: theme.borderColor }]}
        >
            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <View style={styles.profileIconContainer}>
                        {item.avatar ? (
                            <Image
                                source={{ uri: item.avatar }}
                                style={[styles.profileIcon, { borderColor: theme.borderColor }]}
                            />
                        ) : (
                            <View style={[styles.profileIcon, { borderColor: theme.borderColor }]}>
                                <Text style={{ fontSize: wp(isTablet ? '8%' : '10%'), color: theme.text }}>👤</Text>
                            </View>
                        )}
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={styles.textContainer}>
                            <Text style={[styles.chatName, { color: theme.text }]}>
                                {getParticipantName(item)}
                            </Text>
                            <Text style={[styles.chatTime, { color: theme.inputText }]}>
                                {getLastMessageInfo(item).time}
                            </Text>
                        </View>
                        <Text style={[styles.lastMessage, { color: theme.inputText }]} numberOfLines={1}>
                            {getLastMessageInfo(item).text}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const handleGoBack = async () => {
        console.log('Going back');
        router.push("/home");
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.innerContainer}>
                <View style={styles.textContainer}>
                    <TouchableOpacity onPress={handleGoBack}>
                        <Text style={{ color: theme.accent || '#ff00cc', fontSize: wp(isTablet ? '5%' : '6%') }}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.header}>
                        <Text style={[styles.headerText, { color: theme.text }]}>Chats</Text>
                    </View>
                </View>

                {chats.length > 0 ? (
                    <FlatList
                        data={chats}
                        renderItem={renderChatItem}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: hp(isTablet ? '1%' : '2%') }}
                    />
                ) : (
                    <Text style={[styles.noChatsText, { color: theme.inputText }]}>
                        No chats available
                    </Text>
                )}
            </View>

            <BottomNavigation />

            <ErrorPopup
                visible={isErrorPopupVisible}
                message={errorMessage}
                onClose={closeErrorPopup}
            />
        </View>
    );
}