import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export const styles =StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop:hp('4%'),
    },
    searchContainer: {
        padding: wp('2%'),

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    input: {
        flex: 1,
        height: hp('6%'),
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: wp('3%'),
        marginRight: wp('2%'),
    },
    button: {
        paddingVertical: hp('1.5%'),
        paddingHorizontal: wp('4%'),
        borderRadius: 5,
    },
    buttonText: {
        fontSize: hp('2.5%'),
        fontWeight: 'bold',
    },
    map: {
        flex: 1,
        margin: wp('2.5%'),
        borderRadius: 10,
    },

    saveButton: {
        width: wp('70%'),
        height: hp('8%'),
        borderRadius: wp('3%'),
        marginLeft:wp('15%'),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        marginVertical: hp('2%'),
    },

});