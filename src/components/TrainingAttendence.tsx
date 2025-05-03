import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import TrainingMonthGrid from "./TrainingMonthGrid";
import { Training } from "../utils/training";
import { useTheme } from '../contexts/ThemeContext';

interface TrainingCalendarProps {}

function TrainingAttendance({}: TrainingCalendarProps) {
    const { theme } = useTheme();

    const time = new Date();
    const [year, setYear] = useState(time.getFullYear());
    const [month, setMonth] = useState(time.getMonth());
    const [visible, setVisible] = useState<boolean>(false);
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [showDate, setShowDate] = useState<Date>(new Date());

    function next() {
        let _y = year + Number(month == 11);
        let _m = (month + 1) % 12;

        if (_y > time.getFullYear() || (_y == time.getFullYear() && _m > time.getMonth()))
            return;
        setYear(y => y + Number(month == 11));
        setMonth(m => (m + 1) % 12);
    }
    function prev() {
        setYear(y => y - Number(month == 0));
        setMonth(m => (m - 1 + 12) % 12);
    }

    function showDay(trainings: Training[], date: Date) {
        setShowDate(date);
        setTrainings(trainings);
        setVisible(true);
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={prev} style={[styles.arrowButton, {backgroundColor: theme.buttonBackground}]}>
                <Text style={styles.arrowText}>&lt;</Text>
            </TouchableOpacity>

            <View style={styles.gridWrapper}>
                <TrainingMonthGrid
                    year={year - Number(month === 0)}
                    month={(month - 1 + 12) % 12}
                    selectDay={showDay}
                />
                <TrainingMonthGrid
                    year={year}
                    month={month}
                    selectDay={showDay}
                />
            </View>

            <TouchableOpacity onPress={next} style={[styles.arrowButton, {backgroundColor: theme.buttonBackground}]}>
                <Text style={styles.arrowText}>&gt;</Text>
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={visible}
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, {backgroundColor: theme.background}]}>
                        <Text style={[styles.modalText, {color: theme.text}]}>Day: {showDate.toLocaleDateString()}</Text>
                        {(() => {console.log("Trainings: ", trainings); console.log("Length: ", trainings.length); return null;})()}
                        {trainings.length === 0 && <Text style={{color: theme.text}}>There are no recorded trainings in this day</Text>}
                        {trainings.map((train, idx) => {
                            const t = train.time;
                            const t1 = train.time;
                            t1.setMinutes(t.getMinutes() + train.duration);
                            return <View key={idx} style={styles.itemContainer}>
                                <Text style={{color: theme.text}}>{t.getHours()}:{t.getMinutes()}-{t1.getHours()}:{t1.getMinutes()}</Text>
                                <Text style={{color: theme.text}}>With {train.coachName}</Text>
                                <Text style={{color: theme.text}}>Title: {train.title}</Text>
                            </View>
                        })}
                        <TouchableOpacity onPress={() => setVisible(false)} style={{backgroundColor: theme.buttonBackground, padding: 10, borderRadius: 5}}>
                            <Text style={{color: theme.text}}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 1,
    },
    arrowButton: {
        height: 200,
        backgroundColor: "#ddd",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        marginHorizontal: 1,
    },
    arrowText: {
        fontSize: 28,
    },
    gridWrapper: {
        flexDirection: "row",
        gap: 1, // if using RN >= 0.71, or replace with marginRight on first grid if not
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: 'white',
        padding: 5,
        borderRadius: 15,
        minWidth: 250,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
    },
    closeButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 5,
        paddingVertical: 5,
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16
    },
    itemContainer: {
        marginBottom: 10,
    },
});

export default TrainingAttendance;