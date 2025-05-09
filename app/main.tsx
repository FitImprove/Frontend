import {View, Text, TextInput, TouchableOpacity, Platform, ScrollView, KeyboardAvoidingView} from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';
import WaveBackground from '../src/components/WaveBackground';
import { Link } from 'expo-router';
import {useEffect, useState} from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import BottomNavWave from "@/src/components/BottomNavWave";
import {styles} from "@/src/styles/ProfileStyles";
import BottomNavigation from "@/src/components/BottomNavigation";

export default function MainScreen() {
    const { theme } = useTheme();
    async function token() {
        const savedToken = await AsyncStorage.getItem('token');
        console.log('Saved token:', savedToken);
    }

    useEffect(() => {
        token().then(r => console.log(r));

    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingHorizontal: wp('5%'),
                            paddingVertical: hp('2%'),
                            paddingBottom: hp('10%'), // Додаємо відступ знизу для нижньої панелі
                        }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <BottomNavigation />
                    </ScrollView>
            </KeyboardAvoidingView>
    </View>);
}