import { View, Text, TouchableOpacity, Image, Button } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import WaveBackground from "@/src/components/WaveBackground";
import { useCallback, useEffect, useState } from 'react';
import { cancelTrainigRegularUser, getUpcomingLocal, Training } from '@/src/utils/training';
import TrainingCard from '@/src/components/Trainings/TrainingCard';
import TrainingAttendance from '@/src/components/Trainings/TrainingAttendence';
import {styles} from '@/src/styles/HomeScreenStyles';
import { useRouter, Link, useFocusEffect } from 'expo-router';
import BottomNavigation from '@/src/components/BottomNavigation';
import { useRole } from '@/src/contexts/RoleContext';
import TrainingCancelConfirm from '@/src/components/Trainings/TrainingCancelConfirm';
import Toast from 'react-native-toast-message';
import {api, setAuthToken} from "@/src/utils/api";
import asyncStorage from "@react-native-async-storage/async-storage/src/AsyncStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";


const UPCOMING_TRAININGS_CNT = 2;

export default function Home() {
    const { theme, toggleTheme } = useTheme();
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorPopupVisible, setIsErrorPopupVisible] = useState(false);
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


    const router  = useRouter();
    const {role} = useRole();

    console.log("Home role: ", role);
    
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [trainingToCancel, setTrainingToCancel] = useState<Training|null>(null);

    async function init() {
        try {
            const upcoming: Training[] = await getUpcomingLocal();
            setTrainings(upcoming.slice(0, UPCOMING_TRAININGS_CNT));

            // Спроба отримати налаштування з бекенду
            const response = await api.get("/settings/user");
            console.log(response.data);
            const newTheme = response.data.theme.toLowerCase();
            toggleTheme(newTheme);
            await AsyncStorage.setItem("theme", newTheme);
        } catch (error) {
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
    return (
        <View style={[styles.container, {backgroundColor: theme.background}]}>
            <WaveBackground />

            <View style={{width: '95%', padding: 1, borderWidth: 1, borderRadius: 20, borderColor: theme.borderColor, backgroundColor: theme.background, alignItems: 'center'}}>
                {trainings.map((training, idx) => {
                    return <TrainingCard key={idx} training={training} onDelete={(training: Training) => {setTrainingToCancel(training)}}></TrainingCard>
                })}
                <Link href="/trainings/upcoming-trainings" asChild>
                    <TouchableOpacity activeOpacity={0.8}>
                        <View
                            style={{backgroundColor: theme.buttonBackground, padding: 4, borderRadius: 3}}
                        >
                            <Text style={[styles.buttonText, { color: theme.buttonText, fontSize: 15 }]}>Full Schedule</Text>
                        </View>
                    </TouchableOpacity>
                </Link>
            </View>
            <View>
                <TrainingAttendance />
            </View>
            
            {role === 'COACH' && 
                <TouchableOpacity activeOpacity={0.8} onPress={() => {router.push("/trainings/create-training")}}>
                    <View
                        style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}
                    >
                        <Text style={[styles.buttonText, { color: theme.buttonText }]}>CreateTraining</Text>
                    </View>
                </TouchableOpacity>}
            <BottomNavigation />

            {role === 'USER' && <TrainingCancelConfirm training={trainingToCancel} setTraining={setTrainingToCancel} onPress={cancelTraining} />}
            <Toast />
        </View>
    )
}