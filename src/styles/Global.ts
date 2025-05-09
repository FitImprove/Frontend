import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { StyleSheet } from 'react-native';

import { Theme } from "../contexts/ThemeContext";

const getGlobalStyle = (theme: Theme) => {return StyleSheet.create({
    globalContainer: {
        width: wp("100%"), 
        height: hp("100%"), 
        backgroundColor: theme.background
    },
    container: {
        width: wp("100%"),
        height: hp("100%"),
        justifyContent: 'flex-start',
        alignContent: 'center',
        backgroundColor: theme.background,
    },
    titleText: {
        color: theme.text,
        fontSize: wp("9%"),
        textAlign: 'center',
        fontFamily: 'InriaSerif-Regular',
    },
    button: {
        paddingHorizontal: wp("4%"),
        paddingVertical: wp("4%"),
        borderRadius: wp('3%'),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        backgroundColor: theme.buttonBackground,
    },
    buttonText: {
        color: theme.buttonText,
        fontFamily: 'InriaSerif-Regular',
        fontSize: 20
    }
});}

export default getGlobalStyle;