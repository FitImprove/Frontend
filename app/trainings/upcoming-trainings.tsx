import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import WaveBackground from "@/src/components/WaveBackground";
import { Training, getUpcomingLocal } from '@/src/utils/training';
import { useCallback, useEffect, useState } from 'react';
import TrainingCard from '@/src/components/Trainings/TrainingCard';
import { cancelTrainigRegularUser } from "@/src/utils/training";
import { clearDatabase, init as initDB } from '@/src/db/init';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useFocusEffect } from 'expo-router';
import TrainingCancelConfirm from '@/src/components/Trainings/TrainingCancelConfirm';
import { useRole } from '@/src/contexts/RoleContext';

export default function UpcomingTraining() {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const { theme } = useTheme();

    const {role} = useRole();
    const [trainingToCancel, setTrainingToCancel] = useState<Training|null>(null);

    async function init() {
        const upcoming: Training[] = await getUpcomingLocal();
        setTrainings(upcoming);
    }

    useFocusEffect(
        useCallback(() => {
            init();
            return () => {};
        }, [])
    );

    async function onCancel(training: Training) {
        try {
            await cancelTrainigRegularUser(training.id);
            setTrainings(prevTrainings => prevTrainings.filter(t => t.id !== training.id));
        } catch (e) {
            console.log("Error while trying to cancel training");
        }
    }

    return (
    <View style={{width: wp("100%"), height: hp("100%"), backgroundColor: theme.background}}>
        <WaveBackground />
        <ScrollView            contentContainerStyle={{
                                flexGrow: 1,                justifyContent: 'center',
                                alignItems: 'center',                paddingHorizontal: wp('5%'),
                                paddingVertical: hp('2%'),                paddingBottom: hp('12%'),
                            }}            keyboardShouldPersistTaps="handled"
                        >
            <SafeAreaView  style={{ flex: 1, width: '100%' }}  edges={[]}>
                {trainings.map((training, idx) => {
                    return <TrainingCard key={idx} training={training} onDelete={(t: Training) => setTrainingToCancel(t)} />
                })}
            </SafeAreaView>
            {/* <TouchableOpacity onPress={async () => {
                await clearDatabase();
                await initDB();
                init();
            }}>
                <Text>Reload trainings</Text>
            </TouchableOpacity> */}
            {role === 'USER' && <TrainingCancelConfirm training={trainingToCancel} setTraining={setTrainingToCancel} onPress={onCancel} />}
        </ScrollView>
    </View>
    );
}