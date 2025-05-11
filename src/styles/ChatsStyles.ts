import { StyleSheet } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Theme } from '@/src/contexts/ThemeContext';

export const getStyles = (theme: Theme, isTablet: boolean) => {
    if (isTablet) {
        // Стилі для планшетів
        return StyleSheet.create({
            container: {
                flex: 1,
            },
            innerContainer: {
                width: '80%', // Менша ширина для планшетів
                alignItems: 'center',
                marginTop: hp('2%'),
            },
            header: {
                marginBottom: hp('1%'),
            },
            headerText: {
                fontSize: wp('4.5%'), // Менший шрифт для планшетів
                fontWeight: 'bold',
            },
            chatCard: {
                padding: wp('1.5%'),
                borderRadius: 12,
                borderWidth: 1,
                marginBottom: hp('0.8%'),
                marginHorizontal: wp('1%'),
                width: wp('60%'), // Менша ширина картки
                height: hp('10%'), // Менша висота картки
            },
            chatContent: {
                flex: 1,
                justifyContent: 'space-between',
            },
            profileIconContainer: {
                marginRight: wp('2%'),
            },
            profileIcon: {
                width: wp('10%'), // Менший аватар
                height: wp('10%'),
                borderRadius: wp('8%'),
                borderWidth: 2,
                justifyContent: 'center',
                alignItems: 'center',
            },
            chatHeader: {
                flexDirection: 'row',
                alignItems: 'center',
            },
            textContainer: {
                marginBottom: hp('1%'),
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
            },
            chatName: {
                fontSize: wp('3.5%'), // Менший шрифт
                fontWeight: '600',
                marginRight: wp('10%'),
            },
            chatTime: {
                fontSize: wp('2.8%'), // Менший шрифт
            },
            lastMessage: {
                fontSize: wp('3%'), // Менший шрифт
            },
            noChatsText: {
                fontSize: wp('3.5%'), // Менший шрифт
                textAlign: 'center',
                marginTop: hp('3%'),
            },
        });
    } else {
        // Стилі для телефонів (оригінальні)
        return StyleSheet.create({
            container: {
                flex: 1,
            },
            innerContainer: {
                width: '100%',
                alignItems: 'center',
                marginTop: hp('4%'),
            },
            header: {
                marginBottom: hp('2%'),
            },
            headerText: {
                fontSize: wp('6%'),
                fontWeight: 'bold',
            },
            chatCard: {
                padding: wp('2%'),
                borderRadius: 10,
                borderWidth: 1,
                marginBottom: hp('1%'),
                marginHorizontal: wp('2%'),
                width: wp('80%'),
                height: hp('13%'),
            },
            chatContent: {
                flex: 1,
                justifyContent: 'space-between',
            },
            profileIconContainer: {
                marginRight: wp('3%'),
            },
            profileIcon: {
                width: wp('15%'),
                height: wp('15%'),
                borderRadius: wp('10%'),
                borderWidth: 2,
                justifyContent: 'center',
                alignItems: 'center',
            },
            chatHeader: {
                flexDirection: 'row',
                alignItems: 'center',
            },
            textContainer: {
                marginBottom: hp('2%'),
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
            },
            chatName: {
                fontSize: wp('4.5%'),
                fontWeight: '600',
                marginRight: wp('15%'),
            },
            chatTime: {
                fontSize: wp('3.5%'),
            },
            lastMessage: {
                fontSize: wp('4%'),
            },
            noChatsText: {
                fontSize: wp('4%'),
                textAlign: 'center',
                marginTop: hp('5%'),
            },
        });
    }
};