import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, FlatList } from 'react-native';
import { Theme, useTheme } from '@/src/contexts/ThemeContext';
import WaveBackground from "@/src/components/WaveBackground";
import { useCallback, useEffect, useState } from 'react';
import { cancelTrainigRegularUser, getUpcomingLocal, Training, getInvitationsLocal, acceptInvitation as _acceptInvitation, denyInvitation as _denyInvitation } from '@/src/utils/training';
import TrainingCard from '@/src/components/Trainings/TrainingCard';
import TrainingAttendance from '@/src/components/Trainings/TrainingAttendence';
import { useRouter, Link, useFocusEffect } from 'expo-router';
import BottomNavigation from '@/src/components/BottomNavigation';
import { useRole } from '@/src/contexts/RoleContext';
import TrainingCancelConfirm from '@/src/components/Trainings/TrainingCancelConfirm';
import Toast from 'react-native-toast-message';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, getRole, Role, setAuthToken } from "@/src/utils/api";
import { registerTrainingReminderTask, BACKGROUND_NOTIFICATION_TASK } from '@/src/backgroundTasks/backgroundTask';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import getGlobalStyle from '@/src/styles/Global';
import { clearDatabase, TrainingUserDTO } from '@/src/db/init';
import { styles as profileStyles } from "@/src/styles/ProfileStyles";
import { init as initDB } from '@/src/db/init';
import * as TaskManager from 'expo-task-manager';

const UPCOMING_TRAININGS_CNT = 2;

// Визначення типу пристрою (телефон чи планшет)
const { width, height } = Dimensions.get('window');
const isTablet = width >= 768; // Планшетом вважаємо пристрій із шириною екрану >= 768 пікселів

export default function Home() {
    const { theme, toggleTheme } = useTheme();
    const style = isTablet ? getTabletStyle(theme) : getPhoneStyle(theme); // Вибираємо стилі залежно від типу пристрою
    const styles = getGlobalStyle(theme);
    const cancelTrainingError = (e: any) => {
        Toast.show({
            type: 'error',
            text1: 'Error during training canceling',
            text2: e.message || e.response?.status || e,
            visibilityTime: 5000,
        });
    };
    const cancelTrainingSuccess = () => {
        Toast.show({
            type: 'success',
            text1: 'Training was canceled',
            visibilityTime: 2000,
        });
    };

    const router = useRouter();
    const { role } = useRole();

    const [trainings, setTrainings] = useState<Training[]>([]);
    const [invitations, setInvitations] = useState<Training[]>([]);
    const [trainingToCancel, setTrainingToCancel] = useState<Training | null>(null);

    async function _init() {
        const role = (await getRole()) || 'USER';
        await initDB(role as Role);
        const upcoming: Training[] = await getUpcomingLocal();
        console.log("Upcoming: ", upcoming);
        setTrainings(upcoming.slice(0, UPCOMING_TRAININGS_CNT));
    }

    async function initSettings() {
        try {
            // Спроба отримати налаштування з бекенду
            const response = await api.get("/settings/user");
            console.log(response.data);
            const newTheme = response.data.theme.toLowerCase();
            toggleTheme(newTheme);
            await AsyncStorage.setItem("theme", newTheme);
        } catch (error: any) {
            console.log('Error fetching settings from backend:', error);

            if (error.response?.status === 401) {
                await handleLogout();
                router.push('/sign-in');
            } else if (error.response?.status === 403) {
                await handleLogout();
                router.push('/sign-in');
            } else if (error.response?.status === 404) {
                setErrorMessage('User or images not found.');
            } else {
                setErrorMessage('Failed to load user data or images. Please try again.');
                router.push('/home');
            }
            const storedTheme = await AsyncStorage.getItem("theme");
            if (storedTheme) {
                toggleTheme(storedTheme);
            } else {
                toggleTheme("purple");
            }
        }
    }

    useEffect(() => {
        async function q() {
            _init();
            initSettings();
            await registerTrainingReminderTask();
            // await TaskManager. (BACKGROUND_NOTIFICATION_TASK);
        } 
    }, []);

    async function init() {
        const upcoming: Training[] = await getUpcomingLocal();
        console.log("Upcoming: ", upcoming);
        setTrainings(upcoming.slice(0, UPCOMING_TRAININGS_CNT));
        if (role === 'USER')
            setInvitations(await getInvitationsLocal());
    }

    async function handleLogout() {
        try {
            await setAuthToken('');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('role');
            await clearDatabase();
            router.push('/');
        } catch (error) {
            console.error('Error during logout:', error);
            setErrorMessage('Failed to logout. Please try again.');
            setIsErrorPopupVisible(true);
        }
    }
    useFocusEffect(
        useCallback(() => {
            init();
            return () => {};
        }, [])
    );

    async function cancelTraining(training: Training) {
        try {
            await cancelTrainigRegularUser(training.id);
            await init();
            cancelTrainingSuccess();
        } catch (e) {
            cancelTrainingError(e);
        }
    }

    async function acceptInvitation(training: Training) {
        try {
            await _acceptInvitation(training.id);
            await init();
        } catch (e) {
            console.log(e);
        }
    }

    async function denyInvitation(training: Training) {
        try {
            await _denyInvitation(training.id);
            await init();
        } catch (e) {
            console.log(e);
        }
    }

    // Функція для рендерингу TrainingCard у FlatList для планшетів (для trainings)
    const renderTrainingCard = ({ item, index }: { item: Training; index: number }) => (
        <View style={{ width: '49%' }}> {/* Максимально широкі колонки без відступів */}
            <TrainingCard
                key={index}
                training={item}
                onDelete={(training: Training) => { setTrainingToCancel(training); }}
            />
        </View>
    );

    // Функція для рендерингу TrainingCard у FlatList для планшетів (для invitations)
    const renderInvitationCard = ({ item, index }: { item: Training; index: number }) => (
        <View style={{ width: '49%' }}> {/* Максимально широкі колонки без відступів */}
            <TrainingCard
                key={index}
                training={item}
                onDelete={denyInvitation}
                onInvite={acceptInvitation}
                isInvitation={true}
            />
        </View>
    );

    return (
        <View style={style.container}>
            <WaveBackground />
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: wp(isTablet ? '3%' : '5%'), // Менший padding для планшетів
                    paddingVertical: hp(isTablet ? '1%' : '2%'),
                    paddingBottom: hp(isTablet ? '10%' : '15%'),
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
            >
                <View style={{
                    width: '100%',
                    alignItems: 'center',
                    marginTop: hp(isTablet ? '2%' : '4%'),
                }}>
                    <View style={{
                        width: isTablet ? '95%' : '95%', // Максимальна ширина контейнера для планшетів
                        padding: 1,
                        borderWidth: 1,
                        borderRadius: 20,
                        borderColor: theme.borderColor,
                        backgroundColor: theme.background,
                        alignItems: 'center',
                    }}>
                        {isTablet ? (
                            <FlatList
                                data={trainings}
                                renderItem={renderTrainingCard}
                                keyExtractor={(item, index) => index.toString()}
                                numColumns={2} // Дві колонки для планшетів
                                contentContainerStyle={{}} // Прибрано відступи
                            />
                        ) : (
                            trainings.map((training, idx) => (
                                <TrainingCard
                                    key={idx}
                                    training={training}
                                    onDelete={(training: Training) => { setTrainingToCancel(training); }}
                                />
                            ))
                        )}
                        <Link href="/trainings/upcoming-trainings" asChild>
                            <TouchableOpacity activeOpacity={0.8}>
                                <View style={{
                                    backgroundColor: theme.buttonBackground,
                                    padding: 4,
                                    borderRadius: 3,
                                    marginVertical: hp('1%'),
                                }}>
                                    <Text style={[style.buttonText, { color: theme.buttonText, fontSize: isTablet ? 18 : 15 }]}>
                                        Full Schedule
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </Link>
                    </View>
                    <View>
                        <TrainingAttendance />
                    </View>

                    {role === 'COACH' &&
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => { router.push("/trainings/create-training"); }}
                        >
                            <View style={[style.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}>
                                <Text style={[style.buttonText, { color: theme.buttonText }]}>
                                    Create Training
                                </Text>
                            </View>
                        </TouchableOpacity>
                    }

                    {role === 'USER' && <>
                        <Text style={styles.titleText}>Invitations</Text>
                        <View style={{
                            width: isTablet ? '95%' : '95%', // Максимальна ширина контейнера для планшетів
                            padding: 1,
                            borderWidth: 1,
                            borderRadius: 20,
                            borderColor: theme.borderColor,
                            backgroundColor: theme.background,
                            alignItems: 'center',
                        }}>
                            {isTablet ? (
                                <FlatList
                                    data={invitations}
                                    renderItem={renderInvitationCard}
                                    keyExtractor={(item, index) => index.toString()}
                                    numColumns={2} // Дві колонки для планшетів
                                    contentContainerStyle={{}} // Прибрано відступи
                                />
                            ) : (
                                invitations.map((t, idx) => (
                                    <TrainingCard
                                        key={idx}
                                        training={t}
                                        onDelete={denyInvitation}
                                        onInvite={acceptInvitation}
                                        isInvitation={true}
                                    />
                                ))
                            )}
                        </View>
                        <TrainingCancelConfirm
                            training={trainingToCancel}
                            setTraining={setTrainingToCancel}
                            onPress={cancelTraining}
                        />
                    </>}
                </View>
            </ScrollView>
            <BottomNavigation />
            <Toast />
        </View>
    )
}

// Стилі для телефонів
export const getPhoneStyle = (theme: Theme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'flex-start',
            backgroundColor: theme.background,
        },
        image: {
            width: wp('70%'),
            height: hp('35%'),
            borderRadius: wp('3%'),
            borderWidth: 2,
            marginTop: hp('5%'),
        },
        textContainer: {
            alignItems: 'center',
            paddingHorizontal: wp('5%'),
            marginVertical: hp('3%'),
        },
        text: {
            fontSize: wp('7%'),
            fontWeight: 'bold',
            textAlign: 'center',
            fontFamily: 'InriaSerif-Regular',
        },
        buttonContainer: {
            width: '80%',
            marginBottom: hp('5%'),
            alignItems: 'center',
        },
        button: {
            width: wp('70%'),
            height: hp('8%'),
            borderRadius: wp('3%'),
            marginVertical: hp('1.5%'),
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
        },
        buttonText: {
            fontSize: wp('5.5%'),
            fontWeight: 'bold',
            fontFamily: 'InriaSerif-Regular',
        },
    });
};

// Стилі для планшетів
export const getTabletStyle = (theme: Theme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'flex-start',
            backgroundColor: theme.background,
        },
        image: {
            width: wp('50%'), // Менше зображення для планшетів
            height: hp('25%'),
            borderRadius: wp('2%'),
            borderWidth: 2,
            marginTop: hp('3%'),
        },
        textContainer: {
            alignItems: 'center',
            paddingHorizontal: wp('3%'),
            marginVertical: hp('2%'),
        },
        text: {
            fontSize: wp('5%'), // Менший розмір шрифту для планшетів
            fontWeight: 'bold',
            textAlign: 'center',
            fontFamily: 'InriaSerif-Regular',
        },
        buttonContainer: {
            width: '60%',
            marginBottom: hp('3%'),
            alignItems: 'center',
        },
        button: {
            width: wp('50%'), // Менша ширина кнопки
            height: hp('6%'),
            borderRadius: wp('2%'),
            marginVertical: hp('1%'),
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
        },
        buttonText: {
            fontSize: wp('4%'), // Менший шрифт для кнопок
            fontWeight: 'bold',
            fontFamily: 'InriaSerif-Regular',
        },
    });
};