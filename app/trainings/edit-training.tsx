import { View, Text, StyleSheet, ViewStyle, TextStyle, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { Theme, useTheme } from '@/src/contexts/ThemeContext';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import RNPickerSelect, { PickerStyle } from 'react-native-picker-select';
import Toast from 'react-native-toast-message';

import { cancelTrainigCoach, editTrainingCoach, emptyTraining, trainingFromDTO } from '@/src/utils/training';
import api from '@/src/utils/api';
import WaveBackground from "@/src/components/WaveBackground";
import { Training } from '@/src/utils/training';
import TrainingCancelConfirm from '@/src/components/Trainings/TrainingCancelConfirm';
import TrainingDataInput, { validateTrainingData } from '@/src/components/Trainings/TrainingDataInput';
import { TrainingDTO } from '@/src/db/init';
import getGlobalStyle from '@/src/styles/Global';

export default function EditTraining() {
    const incorrectTrainingData = (message: string) => {
        Toast.show({
          type: 'error',
          text1: 'IncorrectTrainingData',
          text2: message,
          visibilityTime: 5000,
        });
    };
    const couldNotCancelTraining = (e: any) => {
        Toast.show({
          type: 'error',
          text1: 'CouldNotCancelTraining',
          text2: `The attempt to cancel training was failed. Error: ${e}`,
          visibilityTime: 6000,
        });
    };
    const editTrainingError = (e: any) => {
        Toast.show({
          type: 'error',
          text1: 'ErrorWhileEdditingTraining',
          text2: `The attempt to edit training was failed. Error: ${e}`,
          visibilityTime: 6000,
        });
    };
    const editTrainingSuccess = () => {
        Toast.show({
          type: 'success',
          text1: 'ErrorWhileEdditingTraining',
          text2: `The training changes where succesfully changed`,
          visibilityTime: 3000,
        });
    };

    const router = useRouter();
    const { theme } = useTheme();
    const style = getStyle(theme);
    const styles = getGlobalStyle(theme);
    const { id } = useLocalSearchParams();

    const [isCancelPopup, setIsCancelPopup] = useState(false);
    const [training, setTraining] = useState<Training>(emptyTraining);

    useEffect(() => {
        api.get<TrainingDTO>(`/trainings/${id}`).then(resp => {
            setTraining( trainingFromDTO(resp.data));
        }).catch(e => {
            console.log("Error while requesting for training: ", e);
        });
    }, [id]);

    async function editTraining() {
        try {
            // ToDo! add saving changes locally
            let text = validateTrainingData(training);
            if (text !== undefined) {
                incorrectTrainingData(`${text}`);
                return;
            }
            await editTrainingCoach({
                id: training.id,
                title: training.title,
                description: training.description,
                freeSlots: training.freeSlots,
                type: training.type,
                forType: training.forType
            });
            editTrainingSuccess();
        } catch (e) {
            editTrainingError(e);
            console.log("Error while commiting changes: ", e);
        }
    }

    async function cancelTraining() {
        try {
            await cancelTrainigCoach(training.id);
            router.back();
        } catch (e) {
            couldNotCancelTraining(e);
            console.log("Error while canceling a training: ", e);
        }
    }
    function viewEnrolled() {
        router.push({
            pathname: '/trainings/view-enrolled',
            params: {id: id}
        });
    }

    return (
        <View style={styles.globalContainer}>
            <WaveBackground />
            <KeyboardAvoidingView
                style={{ flex: 1 }}        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}    >
                <ScrollView contentContainerStyle={style.container} keyboardShouldPersistTaps="handled">
                    <Text style={[style.text, {fontSize: 25, fontWeight: 'bold'}]}>Edit appointment</Text>
                    <TrainingDataInput training={training} setTraining={setTraining} isTimeChangable={false}></TrainingDataInput>
                    <TouchableOpacity activeOpacity={0.8} onPress={editTraining}>
                        <View style={style.button} >
                            <Text style={style.fieldText}>Save</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => setIsCancelPopup(true)}>
                        <View style={style.button} >
                            <Text style={style.fieldText}>Cancel training</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.8} onPress={viewEnrolled}>
                        <View style={style.button} >
                            <Text style={style.fieldText}>View enrolled</Text>
                        </View>
                    </TouchableOpacity>
                    
                    <Toast />
                    <TrainingCancelConfirm training={training} isActive={isCancelPopup} setIsActive={setIsCancelPopup} onPress={cancelTraining}/>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

type Styles = {
    text: TextStyle,
    container: ViewStyle,
    button: ViewStyle,
    fieldText: TextStyle
}

const getStyle = (theme: Theme): Styles => {return StyleSheet.create<Styles>({
    text: {
        color: theme.text,
        fontSize: 20 
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '10%',
        gap: '50px',
        width: '100%',
        height: '100%',
        backgroundColor: theme.background
    },
    button: {
        backgroundColor: theme.buttonBackground,
        paddingVertical: 10,
        borderRadius: 5,
        width: wp(40),
        alignItems: 'center',
        marginVertical: 10
    },
    fieldText: {
        color: theme.background,
        fontSize: 15
    },
})};