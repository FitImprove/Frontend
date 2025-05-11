import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import getGlobalStyle from '@/src/styles/Global';
import { api } from '@/src/utils/api';
import { TrainingUserDTO } from '@/src/db/init';

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
    const style = getStyle(theme);
    const styles = getGlobalStyle(theme);
    const router  = useRouter();
    const {role} = useRole();

    const [trainings, setTrainings] = useState<Training[]>([]);
    const [invitations, setInvitations] = useState<Training[]>([]);
    const [trainingToCancel, setTrainingToCancel] = useState<Training|null>(null);

    async function init() {
        const upcoming: Training[] = await getUpcomingLocal();
        setTrainings(upcoming.slice(0, UPCOMING_TRAININGS_CNT));
        if (role === 'USER')
            setInvitations(await getInvitationsLocal());
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

    return (
        <View style={style.container}>
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
                            <Text style={[style.buttonText, { color: theme.buttonText, fontSize: 15 }]}>Full Schedule</Text>
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
                        style={[style.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}
                    >
                        <Text style={[style.buttonText, { color: theme.buttonText }]}>CreateTraining</Text>
                    </View>
                </TouchableOpacity>}
            <BottomNavigation />

            {role === 'USER' && <>
                <Text style={styles.titleText}>Invitations</Text>
                {invitations.map((t, idx) => 
                    <TrainingCard key={idx} 
                        training={t} 
                        onDelete={denyInvitation} 
                        onInvite={acceptInvitation} 
                        isInvitation={true} />)}

                <TrainingCancelConfirm training={trainingToCancel} setTraining={setTrainingToCancel} onPress={cancelTraining} />
            </>}

            {role === 'USER' && <TrainingCancelConfirm training={trainingToCancel} setTraining={setTrainingToCancel} onPress={cancelTraining} />}
            <Toast />
        </View>
    )
}

export const getStyle = (theme: Theme) => {return StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: hp('7%'),
        backgroundColor: theme.background
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
});}