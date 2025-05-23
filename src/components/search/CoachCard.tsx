import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/src/contexts/ThemeContext';
import { SearchCoachDTO } from '@/src/utils/user';
import { BASE_URL } from '@/src/utils/api';
import { useRouter } from 'expo-router';

/**
 * Props for the CoachCard component
 * @interface CoachCardProps
 */
export interface CoachCardProps {
    /**
     * The coach data to display
     */
    coach: SearchCoachDTO;
    /**
     * Callback function to handle booking the coach
     * @param c - The coach to book
     */
    onBook: (c: SearchCoachDTO) => void;
}

/**
 * A card component to display coach information and allow booking
 * @param {CoachCardProps} props - The component props
 * @returns {JSX.Element} The rendered coach card
 */
const CoachCard: React.FC<CoachCardProps> = ({ coach, onBook }) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const router = useRouter();

    return (
        <View style={styles.card}>
            <Pressable
                style={styles.inBox}
                onPress={() =>
                    router.push({
                        pathname: '/view-profile',
                        params: { userId: coach.id.toString() },
                    })
                }
            >
                <View style={styles.iconContainer}>
                    <MaterialIcons name="account-circle" size={40} color={theme.text} />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.text}>{coach.name}</Text>
                    {coach.gymAddress && (
                        <Text style={styles.text}>{coach.gymAddress}</Text>
                    )}
                    {coach.fields !== null && coach.fields !== '' && (
                        <Text style={styles.text}>{coach.fields}</Text>
                    )}
                </View>
            </Pressable>
            <TouchableOpacity onPress={() => onBook(coach)}>
                <MaterialIcons name="menu-book" size={30} color={theme.text} />
            </TouchableOpacity>
        </View>
    );
};

/**
 * Creates styles for the CoachCard component based on the provided theme
 * @param theme - The theme object containing color and style properties
 * @returns {object} The stylesheet object
 */
const getStyles = (theme: any) =>
    StyleSheet.create({
        card: {
            backgroundColor: theme.inputContainer,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 10,
            margin: 8,
            borderRadius: 10,
        },
        inBox: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            height: '100%',
            width: '80%',
        },
        iconContainer: {
            marginRight: 10,
        },
        infoContainer: {
            flex: 1,
            alignSelf: 'center',
        },
        text: {
            color: theme.text,
        },
    });

export default CoachCard;