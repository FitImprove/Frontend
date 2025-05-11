// App.tsx
import React, { useCallback, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet, Modal } from 'react-native';
import { emptyTraining, Training, trainingFromDTO } from '@/src/utils/training';
import { Theme, useTheme } from '@/src/contexts/ThemeContext';
import TrainingSlotCard from '@/src/components/search/TrainingSlotCard';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { TrainingDTO } from '@/src/db/init';
import { api, getRole, Role } from '@/src/utils/api';
import getGlobalStyle from '@/src/styles/Global';
import BookConfirmation from '@/src/components/search/BookConfirmation';
import { bookTraining } from '@/src/utils/user';
import Toast from 'react-native-toast-message';

function groupTrainingsByDay(trainings: Training[]): Record<string, Training[]> {
    const sorted = [...trainings].sort((a, b) => a.time.getTime() - b.time.getTime());

    return sorted.reduce((acc: Record<string, Training[]>, training) => {
        const dateKey = training.time.toDateString();
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(training);
        return acc;
    }, {});
}

export default function BookTraining() {
    const createTrainingError = (e: any) => {
        Toast.show({
            type: 'error',
            text1: 'Error during creation',
            text2: e.message || e,
            visibilityTime: 5000,
        });
    };
    const createTrainingSuccess = () => {
        Toast.show({
            type: 'success',
            text1: 'Training was booked',
            visibilityTime: 2000,
        });
    };

    const {theme} = useTheme();
    const style = getStyle(theme);
    const styles = getGlobalStyle(theme);
    const {id} = useLocalSearchParams();
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [trainigns, setTrainigns] = useState<Training[]>([]);

    const [isPopUpVisable, setIsPopUpVisable] = useState(false);
    const [chosenTraining, setChosenTraining] = useState(emptyTraining);

    const [role, setRole] = useState<Role>('USER');

    useFocusEffect(
        useCallback(() => {
            console.log("init");
            api.get<TrainingDTO[]>(`/trainings/get-available-trainings/${id}`).then(resp => {
                console.log("Received: ", resp.data);
                let arr = [];
                for (const t of resp.data) {
                    arr.push(trainingFromDTO(t));
                }
                setTrainigns(arr);
            }).catch(e => {console.log(e)});
            return () => {};
        }, [])
    );

    async function book() {
        try {
            await bookTraining(chosenTraining);
            createTrainingSuccess();
        } catch (error: any) {
            if (error.response) {
                // Server responded with a status other than 2xx
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
                alert(`Error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
            } else if (error.request) {
                // Request was made but no response was received
                console.error('Request data:', error.request);
                alert('Error: No response from the server.');
            } else {
                // Something else caused the error
                console.error('Error message:', error.message);
                alert(`Error: ${error.message}`);
            }
            createTrainingError(error);
        }
    }

    function onBook(training: Training) {
        setChosenTraining(training);
        setIsPopUpVisable(true);
    }
    
    const filteredTrainings = startDate
        ? trainigns.filter(t => t.time >= startDate)
        : trainigns;
    const grouped = groupTrainingsByDay(filteredTrainings);

    return (
        <SafeAreaView style={styles.globalContainer}>
            <ScrollView contentContainerStyle={style.container}>
                <Text style={styles.titleText}>Future Trainigns</Text>
                {filteredTrainings.length === 0 && <Text style={style.noDataText}>No future trainings</Text>}
                {Object.entries(grouped).map(([day, trainings]) => (
                    <View key={day} style={style.dayContainer}>
                        <Text style={style.dayText}>{day}</Text>
                        {trainings.map(training => (
                            <TrainingSlotCard key={training.id} training={training} onBook={onBook}/>
                        ))}
                    </View>
                ))}
            </ScrollView>
            <BookConfirmation training={chosenTraining} isActive={isPopUpVisable} setIsActive={setIsPopUpVisable} book={book} />
            <Toast />
        </SafeAreaView>
    );
}

const getStyle = (theme: Theme) => {return StyleSheet.create({
    dayText: {
        color: theme.text,
        fontSize: wp('5%'),
        fontFamily: 'InriaSerif-Regular'
    },
    dayContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        width: wp('100%'),
        height: hp('100%'),
        alignItems: 'center',
        padding: wp('5%')
    },
    noDataText: {
        color: theme.text,
        alignSelf: 'center',
        marginTop: hp('40%'),
        fontSize: wp('7%')
    }
})};
