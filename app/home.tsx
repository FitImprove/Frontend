import { View, Text, TouchableOpacity, Image, Button } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import WaveBackground from "@/src/components/WaveBackground";
import { useEffect, useState } from 'react';
import { cancelTrainigRegularUser, getUpcomingLocal, Training } from '@/src/utils/training';
import TrainingCard from '@/src/components/TrainingCard';
import TrainingAttendance from '@/src/components/TrainingAttendence';
import {styles} from '@/src/styles/HomeScreenStyles';
import { Link } from 'expo-router';

const UPCOMING_TRAININGS_CNT = 2;

export default function Home() {
    const {theme} = useTheme();

    const [trainings, setTrainings] = useState<Training[]>([]);

    async function init() {
        const upcoming: Training[] = await getUpcomingLocal();
        setTrainings(upcoming.slice(0, UPCOMING_TRAININGS_CNT));
    }

    useEffect(() => {
        init();
    }, []);

    async function onTrainingCancel(trainingId: number) {
        try {
            await cancelTrainigRegularUser(trainingId);
            init();
        } catch (e) {
            console.log("Error while canceling a training: ", e);
        }
    }

    return (
        <View style={[styles.container, {backgroundColor: theme.background}]}>
            <WaveBackground />

            <View style={{width: '95%', padding: 1, borderWidth: 1, borderRadius: 20, borderColor: theme.borderColor, backgroundColor: theme.background, alignItems: 'center'}}>
                {trainings.map((training, idx) => {
                    return <TrainingCard key={idx} training={training} onDelete={onTrainingCancel}></TrainingCard>
                })}
                <Link href="/upcoming-trainings" asChild>
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
        </View>
    )
}