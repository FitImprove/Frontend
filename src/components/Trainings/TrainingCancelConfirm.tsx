import { Training } from "../../utils/training";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

interface Props {
    training: Training|null,
    setTraining: React.Dispatch<React.SetStateAction<Training|null>> | ( (t: Training|null) => void ),
    onPress: (training: Training) => void,
}

export default function TrainingCancelConfirm({training, setTraining, onPress}: Props) {
    if (!training) return;
    const style = getStyle();
    const time = training.time.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    return (
    <Modal
        visible={training !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setTraining(null)}
    >
        <View style={style.overlay}>
            <View style={style.modalContainer}>
                <Text style={style.title}>Cancel Training Confirn</Text>
                <Text style={style.message}>Are you sure you want to cancel this training session</Text>
                <Text>Time: {time}</Text>
                <Text>With: {training.coachName}</Text>
                <Text>Title: {training.title}</Text>

                <View style={style.buttonRow}>
                    <TouchableOpacity style={style.cancelButton} onPress={() => setTraining(null)}>
                        <Text style={style.cancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={style.okButton} onPress={() => {
                        onPress(training);
                        setTraining(null);
                    }}>
                        <Text style={style.okText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
    )
}

const getStyle = () => {return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: 'white',
      padding: 24,
      borderRadius: 10,
      width: '80%',
      alignItems: 'center',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    message: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 24,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    cancelButton: {
      flex: 1,
      padding: 12,
      backgroundColor: '#ccc',
      borderRadius: 8,
      marginRight: 8,
      alignItems: 'center',
    },
    okButton: {
      flex: 1,
      padding: 12,
      backgroundColor: '#ff4d4d',
      borderRadius: 8,
      marginLeft: 8,
      alignItems: 'center',
    },
    cancelText: {
      color: '#000',
      fontWeight: 'bold',
    },
    okText: {
      color: '#fff',
      fontWeight: 'bold',
    },
})};