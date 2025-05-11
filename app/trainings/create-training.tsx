import { View, Text, StyleSheet, ViewStyle, TextStyle, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { Theme, useTheme } from '@/src/contexts/ThemeContext';
import { useEffect, useState } from 'react';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import RNPickerSelect, { PickerStyle } from 'react-native-picker-select';
import Toast from 'react-native-toast-message';

import { cancelTrainigCoach, editTrainingCoach, emptyTraining, UserForTrainingDTO } from '@/src/utils/training';
import {api} from '@/src/utils/api';
import WaveBackground from "@/src/components/WaveBackground";
import { Training } from '@/src/utils/training';
import TrainingDataInput, { validateTrainingData } from '@/src/components/Trainings/TrainingDataInput';
import getGlobalStyle from '@/src/styles/Global';
import { createTraining as createTrainignFull } from '@/src/utils/training';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from './suggest-training';
import {styles} from "@/src/styles/ProfileStyles";

export default function CreateTraining() {
    const incorrectTrainingData = (message: string) => {
        Toast.show({
            type: 'error',
            text1: 'IncorrectTrainingData',
            text2: message,
            visibilityTime: 5000,
        });
    };
    const createTrainingError = (e: any) => {
        Toast.show({
            type: 'error',
            text1: 'ErrorWhileEdditingTraining',
            text2: `The attempt to edit training was failed. Error: ${e}`,
            visibilityTime: 6000,
        });
    };
    const createTrainingSuccess = () => {
        Toast.show({
            type: 'success',
            text1: 'Training was',
            text2: `The training changes where succesfully changed`,
            visibilityTime: 3000,
        });
    };

    const [training, setTraining] = useState<Training>(emptyTraining);

    const { theme } = useTheme();
    const style = getStyle(theme);
    const styles = getGlobalStyle(theme);

    // useEffect(() => {
    //     AsyncStorage.setItem('/trainings/suggest/invited', JSON.stringify([]));
    // }, []);

    async function createTraining() {
        console.log("Create Training Called");
        let text = validateTrainingData(training);
        if (text !== undefined) {
            incorrectTrainingData(`${text}`);
            return;
        }
        console.log("Passed");
        let invited: User[] = [];
        const stored = await AsyncStorage.getItem('/trainings/suggest/invited');
        if (stored) {
            invited = JSON.parse(stored) || [];
        }
        try {
            await createTrainignFull(training, invited.map(i => i.id));
            createTrainingSuccess();
            await AsyncStorage.setItem('/trainings/suggest/invited', JSON.stringify([]));
            router.push("/home");
        } catch (e) {
            createTrainingError(e);
        }
    }
    const handleGoBack = async () => {
        console.log('Going back');
        await AsyncStorage.setItem('/trainings/suggest/invited', JSON.stringify([]));
        router.back();
    };
    return <View style={styles.container}> 
        <WaveBackground />   
        <KeyboardAvoidingView
            style={{ flex: 1 }}        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}    >
            <ScrollView            contentContainerStyle={{
                    flexGrow: 1,                justifyContent: 'center',
                    alignItems: 'center',                paddingHorizontal: wp('5%'),
                    paddingVertical: hp('2%'),                paddingBottom: hp('12%'),
                }}            keyboardShouldPersistTaps="handled"
            >
                <TouchableOpacity onPress={handleGoBack}>
                    <Text style={[styles.text, { color: theme.accent || '#ff00cc', fontSize: wp('6%') }]}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.titleText, {marginTop: hp("6%")}]}>Create Appointment</Text>
                <TrainingDataInput training={training} setTraining={setTraining} isTimeChangable={true} />

                <TouchableOpacity activeOpacity={0.8} onPress={createTraining} style={[styles.button, {width: wp('50%')}]}>
                    <Text style={styles.buttonText}>Create</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/trainings/suggest-training')} style={[styles.button, {width: wp('50%'), marginTop: hp("1%")}]}>
                    <Text style={styles.buttonText}>Suggest Training</Text>
                </TouchableOpacity>
                <Toast />
            </ScrollView>
        </KeyboardAvoidingView>
    </View>
}

const getStyle = (theme: Theme) => {return StyleSheet.create({
    container: {
        width: wp("100%"),
        height: hp("100%"),
        alignItems: 'center',
        backgroundColor: theme.background,
    },
    text: {
        fontSize: wp('6%'),
        fontWeight: 'bold',
    },

});}