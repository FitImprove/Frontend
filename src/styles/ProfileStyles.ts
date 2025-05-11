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
    headerText: {
        fontSize: wp('6%'),
        fontWeight: 'bold',
    },
    searchContainer: {
        padding: wp('2%'),
        flexDirection: 'row',
        marginTop:hp('4%'),
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textContainer: {
        marginBottom: hp('2%'),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    text: {
        fontSize: wp('6%'),
        fontWeight: 'bold',
    },
    editButton: {
        paddingVertical: hp('1%'),
        paddingHorizontal: wp('3%'),
        borderRadius: 10,
        borderWidth: 1,
    },
    deleteButton: {
        paddingVertical: hp('1%'),
        paddingHorizontal: wp('3%'),
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom:hp('10%'),
        width: wp('50%'),
    },
    editButtonText: {
        fontSize: wp('4%'),
    },
    profileIconContainer: {
        marginBottom: hp('2%'),
        alignItems: 'center',
    },
    profileIcon: {
        width: wp('20%'),
        height: wp('20%'),
        borderRadius: wp('10%'),
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputContainer: {
        width: '100%',
        padding: wp('5%'),
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: hp('2%'),
    },
    inputWrapper: {
        marginBottom: hp('2%'),
    },
    label: {
        fontSize: wp('4%'),
        marginBottom: hp('0.5%'),
    },
    input: {
        width: '100%',
        padding: wp('3%'),
        borderRadius: 5,
        fontSize: wp('4%'),
    },
    picker: {
        width: '100%',
        padding: wp('3%'),
        borderRadius: 5,
        fontSize: wp('4%'),
    },
    settingsContainer: {
        width: '100%',
        padding: wp('5%'),
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: hp('2%'),
    },
    settingsWrapper: {
        marginBottom: hp('2%'),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: hp('1%'),
        borderTopWidth: 1,
    },
    navIcon: {
        width: wp('10%'),
        height: wp('10%'),
    },
    clientsContainer: {
        width: '100%',
        padding: wp('4%'),
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: hp('2%'),
    },
    clientsWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    clientBox: {
        width: wp('28%'),
        padding: wp('2%'),
        borderRadius: 8,
        marginBottom: hp('1%'),
        alignItems: 'center',
    },
    clientText: {
        fontSize: wp('4%'),
        textAlign: 'center',
    },
});