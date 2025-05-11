import { View, Text, StyleSheet, ViewStyle, TextStyle, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, ScrollView, Platform, FlatList } from 'react-native';
import { Theme, useTheme } from '@/src/contexts/ThemeContext';
import { useEffect, useState } from 'react';
import { api } from '@/src/utils/api';
import WaveBackground from "@/src/components/WaveBackground";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';

export interface User {
    id: number;
    name: string;
    iconPath: string;
}

async function getChats(): Promise<User[]> {
    const chats: any[] = (await api.get('/chats/coach')).data;
    console.log("Chats: ", chats);
    const users: any[] = chats.map(c => c.regularUser);
    let arr: User[] = [];
    for (const u of users) {
        arr.push({ id: u.id, name: u.name + " " + u.surname, iconPath: "" });
    }
    return arr;
}

export default function SuggestTraining() {
    const [users, setUsers] = useState<User[]>([{ id: 1, name: 'Jon', iconPath: 'none' }]);
    const [invited, _setInvited] = useState<User[]>([]);
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const fetchedUsers = await getChats();
                setUsers(fetchedUsers);
            } catch (error) {
                console.error('Error fetching chats:', error);
            }
        };
        fetchUsers();
    }, []);

    function onClick(user: User) {
        const index = invited.findIndex(u => u.id === user.id);
        if (index !== -1) {
            setInvited(invited.filter(u => u.id !== user.id));
        } else {
            setInvited([...invited, user]);
        }
    }

    const handleSave = () => {
        router.back();
    };

    async function setInvited(arr: User[]) {
        _setInvited(arr);
        await AsyncStorage.setItem('/trainings/suggest/invited', JSON.stringify(arr));
    }

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.headerText}>Choose a human to enroll</Text>
            </View>
            <FlatList
                contentContainerStyle={styles.userList}
                data={users}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.userItem}>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{item.name}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: invited.findIndex(u => u.id === item.id) === -1 ? theme.accent : '#FF0000' }]}
                            onPress={() => onClick(item)}
                        >
                            <Text style={styles.addText}>{invited.findIndex(u => u.id === item.id) === -1 ? '+' : '-'}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSave}
                style={[styles.saveButton, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}
            >
                <Text style={[styles.saveButtonText, { color: theme.buttonText }]}>Save</Text>
            </TouchableOpacity>
        </View>
    );
}

export const getStyles = (theme: Theme) => StyleSheet.create({
    container: {
        width: wp('100%'),
        height: hp('100%'),
        backgroundColor: theme.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    headerText: {
        marginTop: hp('5%'),
        flex: 1,
        textAlign: 'center',
        color: theme.inputText,
        fontSize: 18,
        fontWeight: 'bold',
    },
    userList: {
        flexGrow: 1,
        paddingVertical: 10,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 16,
        marginVertical: 6,
        backgroundColor: theme.buttonBackground,
        padding: 10,
        borderRadius: 10,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontSize: 16,
        color: theme.text,
    },
    addButton: {
        borderRadius: 20,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addText: {
        color: theme.buttonText,
        fontSize: 20,
        fontWeight: 'bold',
    },
    saveButton: {
        width: wp('40%'),
        paddingVertical: hp('1.5%'),
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: hp('2%'),
        alignSelf: 'center',
    },
    saveButtonText: {
        fontSize: wp('4%'),
        fontWeight: 'bold',
    },
});