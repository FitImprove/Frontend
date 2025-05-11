import { StyleSheet } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export const styles = StyleSheet.create({
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
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
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