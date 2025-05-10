import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { styles } from '@/src/styles/ChatsStyles';
import { useRouter } from 'expo-router';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { api, getRole, Role } from '@/src/utils/api';
import BottomNavigation from '@/src/components/BottomNavigation';
import ErrorPopup from '../src/components/ErrorPopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function ChatsScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const [chats, setChats] = useState([]);
    const [role, setRole] = useState<Role | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorPopupVisible, setIsErrorPopupVisible] = useState(false);

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
                    setChats(response.data || []);
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
                    }
                    setIsErrorPopupVisible(true);
                }
            };

            loadChats();
        }, [])
    );

    // Перехід до конкретного чату
    const handleChatPress = (chatId: number) => {
        router.push({
            pathname: `/chat`,
            params: { chatId },
        });
    };

    // Закриття попапу помилки
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
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>

                <View style={styles.innerContainer}>
                    <View style={styles.header}>
                        <Text style={[styles.headerText, { color: theme.text }]}>Chats</Text>
                    </View>

                    {chats.length > 0 ? (
                        <FlatList
                            data={chats}
                            renderItem={renderChatItem}
                            keyExtractor={(item) => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: hp('2%') }}
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