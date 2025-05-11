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
            header: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: wp('3%'), // Менші відступи
                paddingVertical: hp('1%'),
                marginTop: hp('2%'),
            },
            backButton: {
                fontSize: wp('5%'), // Менший шрифт
                marginRight: wp('2%'),
            },
            headerText: {
                fontSize: wp('4%'), // Менший шрифт
                fontWeight: 'bold',
            },
            messageContainer: {
                maxWidth: '60%', // Менша максимальна ширина повідомлень
                padding: wp('2%'),
                borderRadius: 12,
                marginVertical: hp('0.5%'),
            },
            sentMessage: {
                alignSelf: 'flex-end',
            },
            receivedMessage: {
                alignSelf: 'flex-start',
            },
            messageText: {
                fontSize: wp('3.5%'), // Менший шрифт
            },
            messageTime: {
                fontSize: wp('2.5%'), // Менший шрифт
                opacity: 0.7,
                marginTop: hp('0.3%'),
            },
            readStatus: {
                fontSize: wp('2.5%'), // Менший шрифт
                opacity: 0.7,
            },
            inputContainer: {
                flexDirection: 'row',
                padding: wp('2%'),
                borderTopWidth: 1,
                alignItems: 'center',
                height: hp('8%'), // Менша висота
                marginBottom: hp('3%'),
                marginHorizontal: wp('3%'),
                borderRadius: 12,
            },
            input: {
                flex: 1,
                padding: hp('0.8%'),
                borderRadius: 12,
                marginRight: wp('2%'),
            },
            sendButton: {
                paddingVertical: hp('0.8%'),
                paddingHorizontal: wp('3%'),
                borderRadius: 12,
            },
            sendButtonText: {
                fontSize: wp('3.5%'), // Менший шрифт
                fontWeight: 'bold',
            },
        });
    } else {
        // Стилі для телефонів (оригінальні)
        return StyleSheet.create({
            container: {
                flex: 1,
            },
            header: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: wp('5%'),
                paddingVertical: hp('2%'),
                marginTop: hp('4%'),
            },
            backButton: {
                fontSize: wp('6%'),
                marginRight: wp('3%'),
            },
            headerText: {
                fontSize: wp('5%'),
                fontWeight: 'bold',
            },
            messageContainer: {
                maxWidth: '70%',
                padding: wp('3%'),
                borderRadius: 10,
                marginVertical: hp('1%'),
            },
            sentMessage: {
                alignSelf: 'flex-end',
            },
            receivedMessage: {
                alignSelf: 'flex-start',
            },
            messageText: {
                fontSize: wp('4%'),
            },
            messageTime: {
                fontSize: wp('3%'),
                opacity: 0.7,
                marginTop: hp('0.5%'),
            },
            readStatus: {
                fontSize: wp('3%'),
                opacity: 0.7,
            },
            inputContainer: {
                flexDirection: 'row',
                padding: wp('3%'),
                borderTopWidth: 1,
                alignItems: 'center',
                height: hp('10%'),
                marginBottom: hp('5%'),
                marginHorizontal: wp('5%'),
                borderRadius: 10,
            },
            input: {
                flex: 1,
                padding: hp('1%'),
                borderRadius: 10,
                marginRight: wp('3%'),
            },
            sendButton: {
                paddingVertical: hp('1%'),
                paddingHorizontal: wp('4%'),
                borderRadius: 10,
            },
            sendButtonText: {
                fontSize: wp('4%'),
                fontWeight: 'bold',
            },
        });
    }
};