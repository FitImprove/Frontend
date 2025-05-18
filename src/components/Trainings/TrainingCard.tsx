import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { Training, shortDaysOfWeek } from '../../utils/training';
import { router } from 'expo-router';
import { useRole } from '@/src/contexts/RoleContext';
import TrainingCancelConfirm from './TrainingCancelConfirm';
import { Theme, useTheme } from '@/src/contexts/ThemeContext';

/**
 * Props for the TrainingCard component
 * @interface TrainingCardProps
 */
export interface TrainingCardProps {
    /**
     * The training session to display
     */
    training: Training;
    /**
     * Callback function to handle deleting the training
     * @param training - The training to delete
     */
    onDelete: (training: Training) => void;
    /**
     * Callback function to handle inviting to the training (optional)
     * @param training - The training to invite to
     */
    onInvite?: (training: Training) => void;
    /**
     * Whether the training is an invitation (optional)
     */
    isInvitation?: boolean;
}

/**
 * A card component to display training details with options to edit, delete, or invite
 * @param {TrainingCardProps} props - The component props
 * @returns {JSX.Element} The rendered training card
 */
function TrainingCard({
                          training,
                          onDelete,
                          onInvite = (t: Training) => {
                              console.log('Unhandled invite');
                          },
                          isInvitation = false,
                      }: TrainingCardProps) {
    const t = training.time;
    const startMinutes = t.getMinutes().toString().padStart(2, '0');
    const end_t = new Date(t.getTime() + training.duration * 60000);
    const endMinutes = end_t.getMinutes().toString().padStart(2, '0');

    const { role } = useRole();

    /**
     * Navigates to the coach profile or enrolled users view based on role
     */
    function openChat() {
        if (role === 'USER') {
            router.push({
                pathname: '/view-profile',
                params: { userId: training.coachId.toString() },
            });
        } else {
            router.push({
                pathname: '/trainings/view-enrolled',
                params: { id: training.id, title: training.title },
            });
        }
    }

    /**
     * Navigates to the training edit screen
     */
    function onEdit() {
        router.push({
            pathname: '/trainings/edit-training',
            params: { id: training.id },
        });
    }

    const { theme } = useTheme();
    const styles = getStyle(theme);

    return (
        <View style={styles.card}>
            <View style={styles.dateSection}>
                <Text style={styles.day}>{shortDaysOfWeek[t.getDay()]}</Text>
                <Text style={styles.date}>{t.getDate().toString().padStart(2, '0')}</Text>
                <Text style={styles.date}>{(t.getMonth() + 1).toString().padStart(2, '0')}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoSection}>
                <Text style={styles.title}>
                    Training{' '}
                    {t && end_t
                        ? `${t.getHours().toString().padStart(2, '0')}:${startMinutes}-${end_t
                            .getHours()
                            .toString()
                            .padStart(2, '0')}:${endMinutes}`
                        : 'Time N/A'}
                </Text>
                <Text style={styles.subtitle}>With {training.coachName}</Text>
                <Text style={styles.subtitle}>Gym: {training.gymName}</Text>
            </View>
            <View style={styles.iconSection}>
                <TouchableOpacity onPress={() => openChat()}>
                    <MaterialCommunityIcons name="account-tie" size={32} color="black" />
                </TouchableOpacity>
                {role === 'COACH' ? (
                    <TouchableOpacity onPress={onEdit}>
                        <FontAwesome name="edit" size={28} color="black" style={styles.trashIcon} />
                    </TouchableOpacity>
                ) : !isInvitation ? (
                    <TouchableOpacity onPress={() => onDelete(training)}>
                        <FontAwesome name="trash" size={28} color="black" style={styles.trashIcon} />
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity onPress={() => onInvite(training)}>
                            <FontAwesome
                                name="check-circle"
                                size={28}
                                color="black"
                                style={styles.trashIcon}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDelete(training)}>
                            <FontAwesome name="trash" size={28} color="black" style={styles.trashIcon} />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

/**
 * Creates styles for the TrainingCard component based on the provided theme
 * @param theme - The theme object containing color and style properties
 * @returns {object} The stylesheet object
 */
export const getStyle = (theme: Theme) => {
    return StyleSheet.create({
        card: {
            flexDirection: 'row',
            backgroundColor: theme.buttonBackground,
            padding: 15,
            margin: 10,
            borderRadius: 15,
            alignItems: 'center',
            elevation: 5,
            flexShrink: 1,
        },
        pressableBox: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        dateSection: {
            alignItems: 'center',
            paddingRight: 10,
        },
        day: {
            color: 'black',
            fontSize: 16,
            fontWeight: 'bold',
        },
        date: {
            color: 'black',
            fontSize: 16,
        },
        divider: {
            width: 1,
            backgroundColor: 'black',
            alignSelf: 'stretch',
            marginRight: 10,
        },
        infoSection: {
            flex: 1,
        },
        title: {
            color: 'black',
            fontSize: 16,
            fontWeight: 'bold',
        },
        subtitle: {
            color: 'black',
            fontSize: 16,
        },
        iconSection: {
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        trashIcon: {
            marginTop: 10,
        },
    });
};

export default TrainingCard;