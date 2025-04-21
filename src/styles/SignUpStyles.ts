import { StyleSheet } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: wp('5%'),
        marginVertical: hp('1%'),
    },
    text: {
        fontSize: wp('9%'),
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'InriaSerif-Regular',
    },
    inputContainer: {
        width: '85%',
        marginVertical: hp('2%'),
        borderRadius: wp('2%'),
        alignItems: 'center',
        borderWidth: 1,
    },
    input: {
        width: wp('75%'),
        height: hp('5%'),
        borderRadius: wp('2%'),
        paddingHorizontal: wp('3%'),
        marginVertical: hp('1%'),
        marginHorizontal: hp('1%'),
        fontSize: wp('4%'),
        fontFamily: 'InriaSerif-Regular',
    },
    buttonContainer: {
        flexDirection: 'row', // Розміщуємо кнопки поруч
        justifyContent: 'space-between',
        width: wp('70%'),
        marginVertical: hp('2%'),
    },
    button: {
        width: wp('32%'), // Зменшуємо ширину, щоб дві кнопки вмістилися
        height: hp('8%'),
        borderRadius: wp('3%'),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    buttonText: {
        fontSize: wp('4.5%'),
        fontWeight: 'bold',
        fontFamily: 'InriaSerif-Regular',
    },
    linkText: {
        fontSize: wp('4%'),
        fontFamily: 'InriaSerif-Regular',
        marginVertical: hp('2%'),
    },
    label: {
        fontSize: wp('5%'),
        fontFamily: 'InriaSerif-Regular',
        marginHorizontal: hp('2%'),
        marginVertical: hp('0.5%'),
    },
    inputWrapper: {
        width: wp('80%'),
    },
    roleField: {
        width: wp('75%'),
        height: hp('5%'),
        borderRadius: wp('2%'),
        paddingHorizontal: wp('3%'),
        marginVertical: hp('1%'),
        marginHorizontal: hp('1%'),
        fontSize: wp('4%'),
        fontFamily: 'InriaSerif-Regular',
        justifyContent: 'center',
    },
    roleText: {
        fontSize: wp('4%'),
        fontFamily: 'InriaSerif-Regular',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: wp('2%'),
    },
    modalContent: {
        width: wp('70%'),

        borderRadius: wp('2%'),
        alignItems: 'center',
        borderWidth: 1,
    },

    modalOptionText: {
        fontSize: wp('5%'),
        fontFamily: 'InriaSerif-Regular',

        paddingVertical: hp('2%'),
        paddingHorizontal: wp('5%'),


    },
});