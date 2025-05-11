import { View, Text, TouchableOpacity, Image, Button } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import WaveBackground from "@/src/components/WaveBackground";
import { useCallback, useEffect, useState } from 'react';
import { cancelTrainigRegularUser, getUpcomingLocal, Training } from '@/src/utils/training';
import TrainingCard from '@/src/components/Trainings/TrainingCard';
import TrainingAttendance from '@/src/components/Trainings/TrainingAttendence';
import {styles} from '@/src/styles/HomeScreenStyles';
import { useRouter, Link, useFocusEffect } from 'expo-router';
<<<<<<< HEAD
import BottomNavigation from '@/src/components/BottomNavigation';
import { useRole } from '@/src/contexts/RoleContext';
import TrainingCancelConfirm from '@/src/components/Trainings/TrainingCancelConfirm';
import Toast from 'react-native-toast-message';
=======
import BottomNavigation from "@/src/components/BottomNavigation";
>>>>>>> 6d57e8042263120a556a637a88313636b4b7ca81

const UPCOMING_TRAININGS_CNT = 2;

export default function Home() {
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

    const {theme} = useTheme();
    const router  = useRouter();
    const {role} = useRole();

    console.log("Home role: ", role);
    
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [trainingToCancel, setTrainingToCancel] = useState<Training|null>(null);

    async function init() {
        const upcoming: Training[] = await getUpcomingLocal();
        setTrainings(upcoming.slice(0, UPCOMING_TRAININGS_CNT));
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
            
<<<<<<< HEAD
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
=======
            <TouchableOpacity activeOpacity={0.8} onPress={() => {router.push("/trainings/create-training")}}>
                <View
                    style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}
                >
                    <Text style={[styles.buttonText, { color: theme.buttonText }]}>CreateTraining</Text>
                </View>
            </TouchableOpacity>
            <BottomNavigation />
>>>>>>> 6d57e8042263120a556a637a88313636b4b7ca81
        </View>
    )
}