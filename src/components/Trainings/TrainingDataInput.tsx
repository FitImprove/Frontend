import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Theme, useTheme } from '@/src/contexts/ThemeContext';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Menu, Button } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';

import { getTrainingType, localISOString } from '@/src/utils/training';
import { Training } from '@/src/utils/training';
import { useState } from 'react';

interface Props {
    training: Training,
    setTraining: React.Dispatch<React.SetStateAction<Training>>,
    isTimeChangable: boolean,
}

function formatTime(date: Date) {
    return date.toLocaleString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

export function validateTrainingData(training: Training): String|undefined {
    if (training.title === "") return "Title can not be empty";
    if (training.type === "")  return "Type can not be empty";
    if (new Date(localISOString(training.time)).getTime() < new Date().getTime()) 
        return "Trying to create training for past time";
    let diff = (training.time.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    if (diff > 360) return "Can not create training for more then 360 days into the future";
    if (training.description.length > 1500) return "Description can have at most 1500 characters";
    if (training.freeSlots < 0) return "FreeSlots can not be negative";
    if (training.freeSlots > 128) return "FreeSlots can not be bigger then 128"
}

export default function TrainingDataInput({ training, setTraining, isTimeChangable }: Props) {
    const { theme } = useTheme();
    const style = getStyle(theme);

    const formattedDate = training.time.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeframe = `${formatTime(training.time)}`;

    const unchangableWarning = () => {
        Toast.show({
            type: 'error',
            text1: 'Unchangable',
            text2: 'The field that was selected can not be changed. If you need to change it recreate the training itself',
            visibilityTime: 2000,
        });
    };

    const [isDateOpen, setIsDateOpen] = useState(false);
    const [isTimeOpen, setIsTimeOpen] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    return <View style={style.container}>
        <View style={style.rowContainer}>
            <Text style={style.fieldText}>Title</Text>
            <TextInput
                style={style.inputField}
                value={training.title}
                onChangeText={(v) => setTraining(t => ({ ...t, title: v }))}
                keyboardType="default"
                autoCapitalize="none"
            />
        </View>
        {!isTimeChangable && <>
            <TouchableOpacity onPress={unchangableWarning} style={style.rowContainer}>
                <Text style={style.fieldText}>Time</Text>
                <Text style={style.inputField}>{timeframe}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={unchangableWarning} style={style.rowContainer}>
                <Text style={style.fieldText}>Date</Text>
                <Text style={style.inputField}>{formattedDate}</Text>
            </TouchableOpacity>
        </>}
        {isTimeChangable && <>
            <View style={style.rowContainer}>
                <Text>Date</Text>
                <TouchableOpacity style={style.inputField} onPress={() => setIsDateOpen(true)}>
                    <Text style={style.inputText}>{formattedDate}</Text>
                </TouchableOpacity>
                {isDateOpen && <DateTimePicker 
                    value={training.time}
                    mode='date'
                    display='default'
                    onChange={(e: any, d: Date|undefined) => {
                        setIsDateOpen(false);
                        setTraining(t => ({ ...t, time: d || t.time }));
                    }} 
                    minimumDate={new Date()}
                    maximumDate={(() => {
                        let maxDate = new Date();
                        maxDate.setFullYear(maxDate.getFullYear() + 1); 
                        return maxDate;
                    })()}/>}
            </View>
            <View style={style.rowContainer}>
                <Text>Time</Text>
                <TouchableOpacity onPress={() => setIsTimeOpen(true)} style={style.inputField}>
                    <Text style={style.inputText}>{timeframe}</Text>
                </TouchableOpacity>
                {isTimeOpen && <DateTimePicker
                    value={training.time}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={(e: any, d: Date|undefined) => {
                        setIsTimeOpen(false);
                        if (!d) return;
                        const updatedDateTime = new Date(training.time);

                        updatedDateTime.setHours(d.getHours());
                        updatedDateTime.setMinutes(d.getMinutes());
                        setTraining(t => ({ ...t, time: updatedDateTime }));
                    }}
                    />}
            </View>
            <View style={style.rowContainer}>
                <Text>Duration</Text>
                <TextInput
                    style={[style.inputField, style.inputText]}
                    value={String(training.duration)}
                    onChangeText={(v: string) => {
                        let duration = Math.min(Number(v), 720);
                        setTraining(t => ({...t, duration}))
                    }}
                    keyboardType="numeric"
                    autoCapitalize="none"
                />
            </View>
        </>}
        
        
        <View style={style.rowContainer}>
            <Text>For</Text>
            <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                    <Button mode="contained" onPress={() => setMenuVisible(true)} style={{ marginLeft: 20 }}>
                        {training.forType || 'Select'}
                    </Button>
                }>
                <Menu.Item onPress={() => { setTraining(t => ({ ...t, forType: getTrainingType('EVERYONE') })); setMenuVisible(false); }} title="everyone" />
                <Menu.Item onPress={() => { setTraining(t => ({ ...t, forType: getTrainingType('LIMITED') })); setMenuVisible(false); }} title="limited" />
            </Menu>
        </View>
        <View style={style.rowContainer}>
            <Text style={style.fieldText}>Type</Text>
            <TextInput
                style={style.inputField}
                value={training.type}
                onChangeText={(v: string) => setTraining(t => ({...t, type: v}))}
                keyboardType="default"
                autoCapitalize="none"
            />
        </View>
        <View style={style.rowContainer}>
            <Text style={style.fieldText}>Free slots</Text>
            <TextInput
                style={style.inputField}
                value={String(training.freeSlots)}
                onChangeText={(v: string) => setTraining(t => ({...t, freeSlots: Number(v)}))}
                keyboardType="numeric"
                autoCapitalize="none"
            />
        </View>
        <View style={style.rowContainer}>
            <Text style={style.fieldText}>Description</Text>
            <TextInput
                style={[style.inputField, {minHeight: 60}]}
                value={training.description}
                onChangeText={(v: string) => setTraining(t => ({...t, description: v}))}
                keyboardType="default"
                autoCapitalize="none"
                multiline={true}
                numberOfLines={32}
                secureTextEntry
            />
        </View>
    </View>
}

function getStyle(theme: Theme) { return StyleSheet.create({
    container: {
        backgroundColor: theme.buttonBackground,
        borderRadius: 15,
        width: '95%',
        padding: 15,
        display: 'flex',
        flexDirection: 'column',
        marginVertical: 10,
    },
    rowContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        paddingHorizontal: 10,
    },
    inputField: {
        backgroundColor: theme.inputBackground,
        borderRadius: 20,
        marginLeft: 20,
        flex: 1,
        // width: wp("100%"),
        minHeight: hp("5%"),
        fontSize: wp('4%'),
        fontFamily: 'InriaSerif-Regular',
        color: theme.inputText,
        textAlign: 'center',
        justifyContent: 'center',
    },
    inputText: {
        fontSize: wp('4%'),
        fontFamily: 'InriaSerif-Regular',
        color: theme.inputText,
        textAlign: 'center',
        justifyContent: 'center'
    },
    fieldText: {
        color: theme.background,
        fontSize: 15
    },
});} 