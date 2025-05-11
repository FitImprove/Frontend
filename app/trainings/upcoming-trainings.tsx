import { View, Text, TouchableOpacity, ScrollView, FlatList, Dimensions } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import WaveBackground from "@/src/components/WaveBackground";
import { Training, getUpcomingLocal } from '@/src/utils/training';
import { useCallback, useEffect, useState } from 'react';
import TrainingCard from '@/src/components/Trainings/TrainingCard';
import { cancelTrainigRegularUser } from "@/src/utils/training";
import { clearDatabase, init as initDB } from '@/src/db/init';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { router, useFocusEffect } from 'expo-router';
import TrainingCancelConfirm from '@/src/components/Trainings/TrainingCancelConfirm';
import { useRole } from '@/src/contexts/RoleContext';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Визначення типу пристрою (телефон чи планшет)
const { width } = Dimensions.get('window');
const isTablet = width >= 768; // Планшетом вважаємо пристрій із шириною екрану >= 768 пікселів

export default function UpcomingTraining() {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const { theme } = useTheme();
    const { role } = useRole();
    const [trainingToCancel, setTrainingToCancel] = useState<Training | null>(null);

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

    const handleGoBack = async () => {
        console.log('Going back');
        router.back();
    };

    // Функція для рендерингу TrainingCard у FlatList для планшетів
    const renderTrainingCard = ({ item, index }: { item: Training; index: number }) => (
        <View style={{ width: '49%' }}> {/* Максимально широкі колонки без відступів */}
            <TrainingCard
                key={index}
                training={item}
                onDelete={(training: Training) => setTrainingToCancel(training)}
            />
        </View>
    );

    return (
        <View style={{ width: wp("100%"), height: hp("100%"), backgroundColor: theme.background }}>
            <WaveBackground />
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: wp(isTablet ? '3%' : '5%'), // Менший padding для планшетів
                    paddingVertical: hp('2%'),
                    paddingBottom: hp('12%'),
                }}
                keyboardShouldPersistTaps="handled"
            >
                <SafeAreaView style={{ flex: 1, width: '100%' }} edges={[]}>
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
                                    onDelete={(training: Training) => setTrainingToCancel(training)}
                                />
                            ))
                        )}
                    </View>
                </SafeAreaView>
                <TouchableOpacity onPress={handleGoBack}>
                    <Text style={{ color: theme.accent || '#ff00cc', fontSize: wp('6%') }}>←</Text>
                </TouchableOpacity>
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