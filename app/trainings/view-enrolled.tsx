import { View, Text, StyleSheet, ViewStyle, TextStyle, TextInput, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';
import { Theme, useTheme } from '@/src/contexts/ThemeContext';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { cancelParticipationCoach, cancelTrainigCoach, editTrainingCoach, emptyTraining, UserDTO } from '@/src/utils/training';
import api, {apiURL} from '@/src/utils/api';
import WaveBackground from "@/src/components/WaveBackground";

export default function ViewEnrolled() {
    const successPopup = (user: UserDTO) => {
        Toast.show({
            type: 'success',
            text1: 'User deleted',
            text2: `User ${user.userName} was deleted from this training`,
            visibilityTime: 1500,
        });
    };
    const cancelParticipationFail = (e: any, user: UserDTO) => {
        Toast.show({
            type: 'error',
            text1: 'Could not cancel participation',
            text2: `The attempt to remove user: ${user.userName} for this training has failed. Error: ${e}`,
            visibilityTime: 6000,
        });
    };

    const { theme } = useTheme();
    const { id, title } = useLocalSearchParams();
    const [enrolled, setEnrolled] = useState<UserDTO[]>([]);
    const styles = getStyle(theme);

    useFocusEffect(
        useCallback(() => {
            api.get<UserDTO[]>(`/trainings/get-enrolled/${id}`).then(resp => {
                console.log(`Trainig with id: ${id} enrolled: `, resp.data);
                setEnrolled(resp.data);
            }).catch(e =>  {console.log(e)});
            return () => {};
        }, [])
    );

    useEffect(() => {
        api.get<UserDTO[]>(`/trainings/get-enrolled/${id}`).then(resp => {
            console.log(`Trainig with id: ${id} enrolled: `, resp.data);
            setEnrolled(resp.data);
        }).catch(e =>  {console.log(e)});
    }, []);

    async function forcefullyCancelTrainingUser(user: UserDTO) {
        // ToCheck!
        try {
            await cancelParticipationCoach(user.userId, user.trainingId);
            setEnrolled(e => e.filter(q => q.userId != user.userId && q.trainingId != user.trainingId));
            successPopup(user);
        } catch (e) {
            cancelParticipationFail(e, user);
            console.log("Error while canceling participation: ", e);
        }
    }

    async function openChat(userId: number) {
        // ToDo!
    }

    function openProfile(userId: number) {
        console.log("OpenProfile");
        // ToDo!
    } 

    for (const elem of enrolled) {
        console.log(`${apiURL}/images/get/${elem.iconPath}`);
    }

    if (enrolled.length === 0) {
        return <View style={styles.emptyContainer}>
            <WaveBackground />

            <Text style={{color: theme.text, fontSize: wp("6%"), textAlign: 'center'}}>There are no people who enrolled or who were invited</Text>
        </View>
    }

    return (
        <View style={{width: wp("100%"), height: hp("100%"), backgroundColor: theme.background}}>
            <WaveBackground />
            <ScrollView contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.titleText}>Enrolled</Text>
                <Text style={[styles.titleText, {fontSize: wp("4%")}]}>{title}</Text>
                {enrolled.map((u, idx) => (
                    
                    <View key={u.userId} style={styles.userCard}>
                        <TouchableOpacity activeOpacity={0.01} onPress={() => openProfile(u.userId)}>
                            <View style={styles.userInfo}>
                                {u.iconPath === null || u.iconPath === ''
                                    ? <Image
                                        source={require('../../assets/images/default-acount.jpg')}
                                        style={{ width: 50, height: 50, borderRadius: 25 }}
                                    />
                                    : <Image
                                        source={{ uri: `${apiURL}/images/get/${u.iconPath}` }}
                                        style={styles.userImage}
                                        resizeMode="cover"
                                    />}
                                <Text style={styles.userName}>{u.userName}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity activeOpacity={0.8} onPress={() => forcefullyCancelTrainingUser(u)}>
                                <FontAwesome name="trash" size={32} color="black" style={styles.icon} />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.8} onPress={() => openChat(u.userId)}>
                                <MaterialCommunityIcons name="account-tie" size={32} color="black" style={styles.icon} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
                <Toast />
            </ScrollView>
        </View>
    );
}

export const getStyle = (theme: Theme) => StyleSheet.create({
    container: {
        backgroundColor: theme.background,
        flex: 1,
        padding: 16,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.buttonBackground,
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        justifyContent: 'space-between',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp('2%'),
    },
    userImage: {
        height: 48,
        width: 48,
        borderRadius: 10,
        marginRight: 12,
    },
    userName: {
        color: theme.text,
        fontSize: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        columnGap: 10,
    },
    icon: {
        marginLeft: wp("2%"),
    },
    emptyContainer: {
        backgroundColor: theme.background,
        height: hp("100%"),
        width: wp("100%"),
        alignContent: 'center',
        justifyContent: 'center',
    },
    titleText: {
        color: theme.text,
        fontSize: wp("9%"),
        textAlign: 'center',
        fontFamily: 'InriaSerif-Regular',
    }
});