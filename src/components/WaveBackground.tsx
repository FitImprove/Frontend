import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext'; // адаптуй шлях
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function WaveBackground() {
    const { theme } = useTheme();

    return (
        <>
            {/* Top wave */}
            <View style={styles.topWave}>
                <Svg height="100%" width="100%" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <Defs>
                        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0%" stopColor={theme.gradient[0]} />
                            <Stop offset="100%" stopColor={theme.gradient[1]} />
                        </LinearGradient>
                    </Defs>
                    <Path
                        fill="url(#grad)"
                        d="M0,64L48,85.3C96,107,192,149,288,165.3C384,181,480,171,576,170.7C672,171,768,181,864,165.3C960,149,1056,107,1152,112C1248,117,1344,171,1392,197.3L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
                    />
                </Svg>
            </View>

            {/* Bottom wave */}
            <View style={styles.bottomWave}>
                <Svg height="100%" width="100%" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <Defs>
                        <LinearGradient id="gradBottom" x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0%" stopColor={theme.gradient[1]} />
                            <Stop offset="100%" stopColor={theme.gradient[0]} />
                        </LinearGradient>
                    </Defs>
                    <Path
                        fill="url(#gradBottom)"
                        d="M0,192L48,170.7C96,149,192,107,288,90.7C384,75,480,85,576,117.3C672,149,768,203,864,224C960,245,1056,235,1152,224C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    />
                </Svg>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    topWave: {
        position: 'absolute',
        top: 0,
        width: wp('100%'),
        height: hp('15%'),
    },
    bottomWave: {
        position: 'absolute',
        bottom: 0,
        width: wp('100%'),
        height: hp('15%'),
    },
});
