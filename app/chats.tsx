import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Dimensions } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { getStyles } from '@/src/styles/ChatsStyles'; // Оновлено імпорт
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

// Визначення типу пристрою (телефон чи планшет)
const { width } = Dimensions.get('window');
const isTablet = width >= 768; // Планшетом вважаємо пристрій із шириною екрану >= 768 пікселів

export default function ChatsScreen() {
    const { theme } = useTheme();
    const styles = getStyles(theme, isTablet); // Вибираємо стилі залежно від типу пристрою
    const router = useRouter();
    const [chats, setChats] = useState([]);
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
                    const chatData = response.data || [];

                    const updatedChats = await Promise.all(
                        chatData.map(async (chat: any) => {
                            const participantId = storedRole === 'COACH' ? chat.regularUser?.id : chat.coach?.id;
                            const avatar = participantId ? await fetchAvatar(participantId) : null;
                            return { ...chat, avatar };
                        })
                    );

                    setChats(updatedChats);
                } catch (error) {
                    console.error('Error loading chats:', error);
                    if (error.response?.status === 401) {
                        setErrorMessage('Session expired. Please sign in again.');
                        router.push('/sign-in');
                    } else if (error.response?.status === 403) {
                        setErrorMessage('Access denied.');
                    } else if (error.response?.status === 404) {
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

    const getParticipantName = (chat: any) => {
        if (role === 'COACH') {
            return `${chat.regularUser?.name || 'Unknown'} ${chat.regularUser?.surname || ''}`.trim();
        } else {
            return `${chat.coach?.name || 'Unknown'} ${chat.coach?.surname || ''}`.trim();
        }
    };

    const getLastMessageInfo = (chat: any) => {
        const messages = chat.messages || [];
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        return {
            text: lastMessage?.content || 'No messages yet',
            time: lastMessage?.sentAt ? new Date(lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        };
    };

    const renderChatItem = ({ item }: { item: any }) => (
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