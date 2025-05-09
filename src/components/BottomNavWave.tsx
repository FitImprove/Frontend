import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function BottomNavWave({ children }) {
    return (
        <View style={styles.container}>
            <Svg height="100%" width="100%" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0%" stopColor="#ff00cc" />
                        <Stop offset="100%" stopColor="#3333ff" />
                    </LinearGradient>
                </Defs>
                <Path
                    fill="url(#grad)"
                    d="
    M0,0
    C360,160 540,-40 720,120
    C900,-40 1080,160 1440,0
    L1440,320 L0,320 Z
  "
                />

            </Svg>
            <View style={styles.buttonContainer}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: wp('100%'),
        height: hp('15%'),
    },
    buttonContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: wp('5%'),
    },
});