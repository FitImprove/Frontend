import { StyleSheet } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('2%'),
        marginTop:hp('4%'),
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
        borderRadius:10,
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