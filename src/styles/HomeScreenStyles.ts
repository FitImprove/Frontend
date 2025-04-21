import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: hp('7%'),
    },
    image: {
        width: wp('70%'),
        height: hp('35%'),
        borderRadius: wp('3%'),
        borderWidth: 2,
        marginTop: hp('5%'),
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: wp('5%'),
        marginVertical: hp('3%'),
    },
    text: {
        fontSize: wp('7%'),
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'InriaSerif-Regular',
    },
    buttonContainer: {
        width: '80%',
        marginBottom: hp('5%'),
        alignItems: 'center',
    },
    button: {
        width: wp('70%'),
        height: hp('8%'),
        borderRadius: wp('3%'),
        marginVertical: hp('1.5%'),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    buttonText: {
        fontSize: wp('5.5%'),
        fontWeight: 'bold',
        fontFamily: 'InriaSerif-Regular',
    },
});