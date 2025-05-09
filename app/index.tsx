import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { styles } from '@/src/styles/HomeScreenStyles';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import WaveBackground from "@/src/components/WaveBackground";
import UpcomingTraining from './upcoming-trainings';


export default function HomeScreen() {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <WaveBackground />
            <SafeAreaView  style={{ flex: 1 }}  edges={[]} >
                {/* Зображення */}
                <Image
                    source={require('../assets/images/welcome-image.png')}
                    style={[styles.image, { borderColor: theme.borderColor }]}
                    resizeMode="cover"
                />

                {/* Текст */}
                <View style={styles.textContainer}>
                    <Text style={[styles.text, { color: theme.text }]}>
                        Get Started on Your{'\n'}Fitness Journey –{'\n'}Sign Up or Log In!
                    </Text>
                </View>

                {/* Кнопки */}
                <View style={styles.buttonContainer}>
                    <Link href="/sign-in" asChild>
                        <TouchableOpacity activeOpacity={0.8}>
                            <View
                                style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}
                            >
                                <Text style={[styles.buttonText, { color: theme.buttonText }]}>Sign in</Text>
                            </View>
                        </TouchableOpacity>
                    </Link>
                    <Link href="/sign-up" asChild>
                        <TouchableOpacity activeOpacity={0.8}>
                            <View
                                style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}
                            >
                                <Text style={[styles.buttonText, { color: theme.buttonText }]}>Sign up</Text>
                            </View>
                        </TouchableOpacity>
                    </Link>

                    {/* TEMPORARY just for testing */}
                    <Link href="/home" asChild>
                        <TouchableOpacity activeOpacity={0.8}>
                            <View
                                style={[styles.button, { backgroundColor: theme.buttonBackground, borderColor: theme.borderColor }]}
                            >
                                <Text style={[styles.buttonText, { color: theme.buttonText }]}>Home</Text>
                            </View>
                        </TouchableOpacity>
                    </Link>
                </View>
            </SafeAreaView>
        </View>
    );
}