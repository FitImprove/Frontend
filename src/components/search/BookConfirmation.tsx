import { Theme, useTheme } from "@/src/contexts/ThemeContext";
import { Training } from "@/src/utils/training";
import { useState } from "react";
import { Modal, StyleSheet, View, Text, TouchableOpacity } from "react-native";

interface Props {
    training: Training;
    book: () => void;
    isActive: boolean;
    setIsActive: React.Dispatch<React.SetStateAction<boolean>>,
}

export default function BookConfirmation({training, book, isActive, setIsActive}: Props) {
    const {theme} = useTheme();
    const style = getStyle(theme);

    const t = training.time;
    const startMinutes = t.getMinutes().toString().padStart(2, "0");
    const end_t = new Date(t.getTime() + training.duration * 60000);
    const endMinutes = end_t.getMinutes().toString().padStart(2, "0");

    return <Modal
        visible={isActive}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsActive(false)}
    >
        <View style={style.modalBackground}>
            <View style={style.modalContainer}>
                <Text style={style.title}>Confirm Your Registration</Text>
                <View style={style.detailsContainer}>
                    <Text style={style.detailText}>Title: {training.title}</Text>
                    <Text style={style.detailText}>Date: {t.toDateString()}</Text>
                    <Text style={style.detailText}>Time: {`${t.getHours()}:${startMinutes} - ${end_t.getHours()}:${endMinutes}`}</Text>
                    <Text style={style.detailText}>Coach: {training.coachName}</Text>
                </View>
                <View style={style.buttonContainer}>
                    <TouchableOpacity style={style.cancelButton} onPress={() => setIsActive(false)}>
                        <Text style={theme.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={style.confirmButton} onPress={() => { book(); setIsActive(false) }}>
                        <Text style={theme.buttonText}>Confirm</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
}

const getStyle = (theme: Theme) => { return StyleSheet.create({
    modalBackground: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // This remains constant, transparent background
    },
    modalContainer: {
      width: 300,
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: theme.inputContainer, // Uses theme's input container color
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: theme.textOnElement,
    },
    detailsContainer: {
      marginBottom: 20,
    },
    detailText: {
      fontSize: 16,
      marginBottom: 5,
      color: theme.text,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    cancelButton: {
      flex: 1,
      marginRight: 10,
      paddingVertical: 10,
      borderRadius: 5,
      backgroundColor: theme.buttonBackground,
      alignItems: 'center',
    },
    confirmButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 5,
      backgroundColor: theme.buttonBackground,
      alignItems: 'center',
    },
});}