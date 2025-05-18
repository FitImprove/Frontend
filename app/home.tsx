import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, FlatList, Pressable } from 'react-native';
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
import { clearDatabase, updateDB } from '@/src/db/init';
import { init as initDB } from '@/src/db/init';
import * as BackgroundFetch from 'expo-background-fetch';


const UPCOMING_TRAININGS_CNT = 2;


const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
/**
 * Home component displays upcoming trainings and invitations for the logged-in user.
 * @remarks
 * It fetches and shows a limited number of upcoming training sessions with options to cancel them.
 * For users with the role 'USER', it also displays training invitations that can be accepted or denied.
 * Coaches have the ability to navigate to a screen for creating new trainings.
 * The component manages theme initialization and handles user logout securely.
 * It supports responsive layouts by adapting styles for phones and tablets.
 * Background tasks are registered to manage training reminders.
 * Toast notifications provide feedback for success or error states during operations.
 */
export default function Home() {
    const { theme, toggleTheme } = useTheme();
    const style = isTablet ? getTabletStyle(theme) : getPhoneStyle(theme); 
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
    console.log(`Role in home: ${role}`);

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
            
            const response = await api.get("/settings/user");
            console.log(response.data);
            let _theme = await AsyncStorage.getItem('theme');
            if (_theme === undefined || _theme === null) {
                _theme = response.data.theme.toLowerCase();
            }
            toggleTheme(_theme);
            if (_theme)
                await AsyncStorage.setItem("theme", _theme.toLowerCase());
        } catch (error: any) {
            console.log('Error fetching settings from backend:', error);

            if (error.response?.status === 401) {
                await handleLogout();
                router.push('/sign-in');
            } else if (error.response?.status === 403) {
                await handleLogout();
                router.push('/sign-in');
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
            // const testBackgroundTask = async () => {
            //     const result = await BackgroundFetch.performFetchAsync(BACKGROUND_NOTIFICATION_TASK);
            //     console.log('Manual background task result:', result);
            // };testBackgroundTask();
        }
        q();
    }, []);

    async function init() {
        const upcoming: Training[] = await getUpcomingLocal();
        setTrainings(upcoming.slice(0, UPCOMING_TRAININGS_CNT));
        if (role === 'USER')
            setInvitations(await getInvitationsLocal());
        
        if (await updateDB(role)) {
            const _upcoming: Training[] = await getUpcomingLocal();
            setTrainings(_upcoming.slice(0, UPCOMING_TRAININGS_CNT));
            if (role === 'USER')
                setInvitations(await getInvitationsLocal());
            else setInvitations([]);
        }
    }

    async function handleLogout() {
        try {
            await setAuthToken('');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('role');
            await clearDatabase();
            router.push('/');
        } catch (error: any) {
            console.error('Error during logout:', error);
            
            
        }
    }
    useFocusEffect(
        useCallback(() => {
            init();

            return () => {};
        }, [role])
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

    
    const renderTrainingCard = ({ item, index }: { item: Training; index: number }) => (
        <View style={{ width: '49%' }}> {/* Максимально широкі колонки без відступів */}

            <TrainingCard
                key={index}
                training={item}
                onDelete={(training: Training) => { setTrainingToCancel(training); }}
            />
        </View>
    );

    
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
                    paddingHorizontal: wp(isTablet ? '3%' : '5%'), 
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
                        width: isTablet ? '95%' : '95%', 
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
                                numColumns={2} 
                                contentContainerStyle={{}} 
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
                            width: isTablet ? '95%' : '95%', 
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
                                    numColumns={2} 
                                    contentContainerStyle={{}} 
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


export const getTabletStyle = (theme: Theme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'flex-start',
            backgroundColor: theme.background,
        },
        image: {
            width: wp('50%'), 
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
            fontSize: wp('5%'), 
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
            width: wp('50%'), 
            height: hp('6%'),
            borderRadius: wp('2%'),
            marginVertical: hp('1%'),
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
        },
        buttonText: {
            fontSize: wp('4%'), 
            fontWeight: 'bold',
            fontFamily: 'InriaSerif-Regular',
        },
    });
};