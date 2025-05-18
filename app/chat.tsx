import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image, Dimensions } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { getStyles } from '@/src/styles/ChatStyles';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { api, getBaseApi } from '@/src/utils/api';
import ErrorPopup from '../src/components/ErrorPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { encode } from 'base64-arraybuffer';
import { AxiosError } from 'axios';

/**
 * Interface for a chat message
 * @interface Message
 */
export interface Message {
    id: number;
    chatId: number;
    senderId: number;
    senderRole: string;
    content: string;
    sentAt: string;
    deliveredAt: string;
    isRead: boolean;
}

/**
 * Interface for a chat participant
 * @interface Participant
 */
export interface Participant {
    id: number;
    name: string;
    surname: string;
}

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

/**
 * ChatsScreen component for displaying the list of chat conversations
 * @remarks
 * - Fetches the current user's role and chats from the API based on that role.
 * - Caches and loads avatars efficiently using Expo FileSystem and base64 encoding.
 * - Handles navigation to individual chat screens.
 * - Shows error popups for common API errors like unauthorized or forbidden access.
 * - Uses useFocusEffect to reload chats each time the screen is focused.
 * - Applies dynamic theming via a ThemeContext.
 * - Responsive layout adapts for tablets and phones using screen width detection.
 * - No props are required as data and navigation are handled internally.
 *
 * @returns {JSX.Element} The rendered chat list screen with navigation and error handling.
 */
export default function ChatScreen() {
    const { theme } = useTheme();
    const styles = getStyles(theme, isTablet);
    const router = useRouter();
    const { chatId } = useLocalSearchParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorPopupVisible, setIsErrorPopupVisible] = useState(false);
    const webSocket = useRef<WebSocket | null>(null);
    const flatListRef = useRef<FlatList | null>(null);
    const [userId, setUserId] = useState('');
    const [userRole, setUserRole] = useState('');
    const [participant, setParticipant] = useState<Participant | null>(null);
    const [avatar, setAvatar] = useState<string | null>(null);

    /**
     * Fetches an image by its path and caches it locally
     * @param path - The path to the image
     * @returns {Promise<string>} The local URI of the cached image
     */
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

    /**
     * Initializes the chat by fetching user data, messages, and participant info, and sets up WebSocket
     */
    useEffect(() => {
        const initializeChat = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                const storedRole = await AsyncStorage.getItem('role');
                if (!storedUserId || !storedRole) {
                    setErrorMessage('User data not found. Please sign in again.');
                    setIsErrorPopupVisible(true);
                    router.push('/');
                    return;
                }
                setUserId(storedUserId);
                setUserRole(storedRole);

                const parsedChatId = Array.isArray(chatId) ? parseInt(chatId[0]) : parseInt(chatId);
                if (isNaN(parsedChatId)) {
                    throw new Error('Invalid chat ID');
                }

                const messagesResponse = await api.get(`/chats/${parsedChatId}/messages`);
                setMessages(messagesResponse.data || []);

                const chatResponse = await api.get(`/chats/${parsedChatId}`);
                const chatData = chatResponse.data;
                const participantData = storedRole === 'COACH'
                    ? chatData.regularUser
                    : chatData.coach;

                if (participantData) {
                    setParticipant({
                        id: participantData.id,
                        name: participantData.name || 'Unknown',
                        surname: participantData.surname || '',
                    });

                    try {
                        const descriptorsResponse = await api.get(`/images/descriptors/${participantData.id}`);
                        const descriptorsData = descriptorsResponse.data;
                        if (descriptorsData && descriptorsData.length > 0 && descriptorsData[0].path) {
                            const base64Image = await fetchImageByPath(descriptorsData[0].path);
                            setAvatar(base64Image);
                        }
                    } catch (error) {
                        console.error('Error fetching participant avatar:', error);
                        setAvatar(null);
                    }
                }

                console.log('Attempting WebSocket connection to: ws://' + getBaseApi() + '/ws/chat/' + parsedChatId);
                webSocket.current = new WebSocket(`ws://${getBaseApi()}/ws/chat/${parsedChatId}`);

                webSocket.current.onopen = () => {
                    console.log('WebSocket connected');
                };

                webSocket.current.onmessage = (event) => {
                    console.log('Received message:', event.data);
                    const receivedMessage: Message = JSON.parse(event.data);
                    setMessages((prevMessages) => {
                        const exists = prevMessages.some((msg) => msg.id === receivedMessage.id);
                        if (!exists) {
                            return [...prevMessages, receivedMessage];
                        }
                        return prevMessages;
                    });
                };

                webSocket.current.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setErrorMessage('Failed to connect to chat. Please try again.');
                    setIsErrorPopupVisible(true);
                };

                webSocket.current.onclose = () => {
                    console.log('WebSocket disconnected');
                };
            } catch (error) {
                const axiosError = error as AxiosError;
                console.error('Error loading chat:', axiosError);
                if (axiosError.response?.status === 401) {
                    setErrorMessage('Session expired. Please sign in again.');
                    router.push('/sign-in');
                } else {
                    setErrorMessage('Failed to load chat. Please try again.');
                }
                setIsErrorPopupVisible(true);
            }
        };

        initializeChat();

        return () => {
            if (webSocket.current) {
                webSocket.current.close();
                webSocket.current = null;
            }
        };
    }, [chatId]);

    /**
     * Sends a new message via WebSocket
     */
    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        const parsedChatId = Array.isArray(chatId) ? parseInt(chatId[0]) : parseInt(chatId);
        const parsedUserId = parseInt(userId);

        const message: Message = {
            chatId: parsedChatId,
            senderId: parsedUserId,
            senderRole: userRole,
            content: newMessage,
            sentAt: new Date().toISOString(),
            deliveredAt: new Date().toISOString(),
            isRead: false,
            id: Date.now(),
        };

        if (webSocket.current && webSocket.current.readyState === WebSocket.OPEN) {
            console.log('Sending message:', message);
            webSocket.current.send(JSON.stringify(message));
            setNewMessage('');
            setTimeout(() => {
                if (flatListRef.current) {
                    flatListRef.current.scrollToEnd({ animated: true });
                }
            }, 100);
        } else {
            setErrorMessage('Not connected to chat. Please try again.');
            setIsErrorPopupVisible(true);
        }
    };

    /**
     * Closes the error popup
     */
    const closeErrorPopup = () => {
        setIsErrorPopupVisible(false);
        setErrorMessage('');
    };

    /**
     * Navigates to the participant's profile
     */
    const handleViewProfile = () => {
        if (participant) {
            console.log(participant.id);
            router.push({
                pathname: '/view-profile',
                params: { userId: participant.id.toString() },
            });
        }
    };

    /**
     * Renders a single chat message
     * @param param0 - The message item
     * @returns {JSX.Element} The rendered message
     */
    const renderMessage = ({ item }: { item: Message }) => {
        const isSender = item.senderId === parseInt(userId);

        return (
            <View
                style={[
                    styles.messageContainer,
                    isSender ? styles.sentMessage : styles.receivedMessage,
                    { backgroundColor: isSender ? theme.buttonBackground : theme.inputBackground },
                ]}
            >
                <Text style={[styles.messageText, { color: isSender ? theme.buttonText : theme.inputText }]}>
                    {item.content}
                </Text>
                <Text style={[styles.messageTime, { color: isSender ? theme.buttonText : theme.inputText }]}>
                    {item.sentAt ? new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Invalid Date'}
                </Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background, flex: 1 }]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View style={[styles.header, { flexDirection: 'row', alignItems: 'center' }]}>
                    <TouchableOpacity onPress={() => router.push('/chats')}>
                        <Text style={[styles.backButton, { color: theme.accent || '#ff00cc' }]}>←</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleViewProfile}
                        style={{ flexDirection: 'row', alignItems: 'center', marginLeft: wp('2%') }}
                        disabled={!participant}
                    >
                        {avatar ? (
                            <Image
                                source={{ uri: avatar }}
                                style={{
                                    width: wp(isTablet ? '6%' : '8%'),
                                    height: wp(isTablet ? '6%' : '8%'),
                                    borderRadius: wp(isTablet ? '3%' : '4%'),
                                    borderWidth: 1,
                                    borderColor: theme.borderColor,
                                    marginRight: wp('2%'),
                                }}
                            />
                        ) : (
                            <View
                                style={{
                                    width: wp(isTablet ? '6%' : '8%'),
                                    height: wp(isTablet ? '6%' : '8%'),
                                    borderRadius: wp(isTablet ? '3%' : '4%'),
                                    borderWidth: 1,
                                    borderColor: theme.borderColor,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: wp('2%'),
                                }}
                            >
                                <Text style={{ fontSize: wp(isTablet ? '4%' : '5%'), color: theme.text }}>👤</Text>
                            </View>
                        )}
                        <Text style={[styles.headerText, { color: theme.text }]}>
                            {participant ? `${participant.name} ${participant.surname}`.trim() : 'Chat'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingVertical: hp('2%'), paddingHorizontal: wp(isTablet ? '3%' : '5%'), flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => {
                        if (flatListRef.current) {
                            flatListRef.current.scrollToEnd({ animated: true });
                        }
                    }}
                />

                <View
                    style={[
                        styles.inputContainer,
                        { backgroundColor: theme.inputContainer, borderColor: theme.borderColor },
                    ]}
                >
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputText }]}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        placeholder="Type a message..."
                        placeholderTextColor={theme.inputText}
                    />
                    <TouchableOpacity
                        onPress={handleSendMessage}
                        style={[styles.sendButton, { backgroundColor: theme.buttonBackground }]}
                    >
                        <Text style={[styles.sendButtonText, { color: theme.buttonText }]}>Send</Text>
                    </TouchableOpacity>
                </View>

                <ErrorPopup visible={isErrorPopupVisible} message={errorMessage} onClose={closeErrorPopup} />
            </KeyboardAvoidingView>
        </View>
    );
}