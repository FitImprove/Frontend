import { View, Text, TouchableOpacity, Image, Button } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { styles } from '@/src/styles/HomeScreenStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import WaveBackground from "@/src/components/WaveBackground";
import { Training, getUpcomingLocal } from '@/src/utils/training';
import { useEffect, useState } from 'react';
import TrainingCard from '@/src/components/TrainingCard';
import { cancelTrainigRegularUser } from "@/src/utils/training";

export default function UpcomingTraining() {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const { theme } = useTheme();

    useEffect(() => {
        async function init() {
            const upcoming: Training[] = await getUpcomingLocal();
            setTrainings(upcoming);
        }
        init();
    }, []);

    async function onDelete(trainingId: number) {
        try {
            await cancelTrainigRegularUser(trainingId);
            setTrainings(prevTrainings => prevTrainings.filter(t => t.id !== trainingId));
        } catch (e) {
            console.log("Error while trying to cancel training");
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <WaveBackground />
            <SafeAreaView  style={{ flex: 1, width: '100%' }}  edges={[]}>
                {trainings.map((training, idx) => {
                    return <TrainingCard key={training.id} training={training} onDelete={onDelete} />
                })}
            </SafeAreaView>
        </View>
    );
}