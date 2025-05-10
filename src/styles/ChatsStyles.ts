import { StyleSheet } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop:hp('4%'),
    },
    header: {
        marginBottom: hp('2%'),
    },
    headerText: {
        fontSize: wp('6%'),
        fontWeight: 'bold',
    },
    chatCard: {
        padding: wp('4%'),
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: hp('1%'),
        marginHorizontal: wp("2%"),
    },
    chatContent: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp('0.5%'),
    },
    chatName: {
        fontSize: wp('4.5%'),
        fontWeight: '600',
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