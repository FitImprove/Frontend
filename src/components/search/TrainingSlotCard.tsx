import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { Training, shortDaysOfWeek } from '../../utils/training';
import { router } from 'expo-router';
import { getRole, Role } from '@/src/utils/api';
import { Theme, useTheme } from '@/src/contexts/ThemeContext';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";


interface Props {
    training: Training;
    onBook: (t: Training) => void;
}

function TrainingSlotCard({training, onBook}: Props) {
    const t = training.time;
    const startMinutes = t.getMinutes().toString().padStart(2, "0");
    const end_t = new Date(t.getTime() + training.duration * 60000);
    const endMinutes = end_t.getMinutes().toString().padStart(2, "0");

    const theme = useTheme();
    const style = getStyle(theme);

    return (
    <View style={style.card}>
        <View style={style.infoSection}>
            <Text style={style.title}>{`${t.getHours()}:${startMinutes}-${end_t.getHours()}:${endMinutes}`}</Text>
            {training.gymName && <Text style={style.subtitle}>Gym: {training.gymName}</Text>}
        </View>
        <TouchableOpacity onPress={() => onBook(training)}>
            <Text style={style.book}>📕</Text>
        </TouchableOpacity>
    </View>
    );
};

export default TrainingSlotCard;

export const getStyle = (theme: Theme) => {return StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#B025F2',
    padding: 15,
    margin: 10,
    borderRadius: 15,
    justifyContent: 'space-between',
    elevation: 5,
    flexShrink: 1,
  },
  pressableBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  book: {
    position: 'absolute',
    right: wp('2%'),
    color: theme.textOnElement,
    fontSize: wp('7%'),
    },
})};