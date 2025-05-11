import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { Training, shortDaysOfWeek } from '../../utils/training';
import { router } from 'expo-router';
import { useRole } from '@/src/contexts/RoleContext';
import TrainingCancelConfirm from './TrainingCancelConfirm';

interface Props {
    training: Training;
    onDelete: (training: Training) => void;
}

function TrainingCard({training, onDelete}: Props) {
    const t = training.time;
    const startMinutes = t.getMinutes().toString().padStart(2, "0");
    const end_t = new Date(t.getTime() + training.duration * 60000);
    const endMinutes = end_t.getMinutes().toString().padStart(2, "0");

    const {role} = useRole();

    function openChat() {
      // ToDo!
      router.push('/sign-in');
    }

    function onEdit() {
        router.push({
            pathname: '/trainings/edit-training',
            params: {id: training.id}
        });
    }

    return (
    <View style={styles.card}>
        <View style={styles.dateSection}>
            <Text style={styles.day}>{shortDaysOfWeek[t.getDay()]}</Text>
            <Text style={styles.date}>{t.getDate().toString().padStart(2, "0")}</Text>
            <Text style={styles.date}>{(t.getMonth() + 1).toString().padStart(2, "0")}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoSection}>
            <Text style={styles.title}>Training {`${t.getHours()}:${startMinutes}-${end_t.getHours()}:${endMinutes}`}</Text>
            <Text style={styles.subtitle}>With {training.coachName}</Text>
            <Text style={styles.subtitle}>Gym: {training.gymName}</Text>
        </View>
        <View style={styles.iconSection}>
            <TouchableOpacity onPress={() => openChat()}>
              <MaterialCommunityIcons name="account-tie" size={32} color="black" />
            </TouchableOpacity>
            {role === 'COACH' 
              ? <TouchableOpacity onPress={onEdit}>
                  <FontAwesome name="edit" size={28} color="black" style={styles.trashIcon} />
              </TouchableOpacity>
              : <TouchableOpacity onPress={() => onDelete(training)}>
                  <FontAwesome name="trash" size={28} color="black" style={styles.trashIcon} />
              </TouchableOpacity>}
        </View>
    </View>
    );
};

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#B025F2',
    padding: 15,
    margin: 10,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
    flexShrink: 1
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

export default TrainingCard;