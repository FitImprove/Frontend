import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

/**
 * Props for the ErrorPopup component
 * @interface ErrorPopupProps
 */
export type ErrorPopupProps = {
    /** Whether the popup is visible */
    visible: boolean;
    /** The error message to display */
    message: string;
    /** Callback to close the popup */
    onClose: () => void;
};

/**
 * A modal popup for displaying error messages
 * @param {ErrorPopupProps} props - The component props
 * @returns {JSX.Element} The rendered error popup
 */
const ErrorPopup: React.FC<ErrorPopupProps> = ({ visible, message, onClose }) => {
    const { theme } = useTheme();

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)', // Напівпрозорий фон
            }}>
                <View style={{
                    width: wp('80%'),
                    backgroundColor: theme.inputContainer,
                    borderRadius: wp('4%'),
                    padding: wp('5%'),
                    borderWidth: 1,
                    borderColor: theme.borderColor,
                    alignItems: 'center',
                }}>
                    <Text style={{
                        color: theme.text,
                        fontSize: wp('4.5%'),
                        marginBottom: hp('2%'),
                        textAlign: 'center',
                    }}>
                        {message}
                    </Text>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={onClose}
                    >
                        <View style={{
                            backgroundColor: theme.buttonBackground,
                            paddingVertical: hp('1%'),
                            paddingHorizontal: wp('5%'),
                            borderRadius: wp('2%'),
                            borderWidth: 1,
                            borderColor: theme.borderColor,
                        }}>
                            <Text style={{
                                color: theme.buttonText,
                                fontSize: wp('4%'),
                                fontWeight: 'bold',
                            }}>
                                OK
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default ErrorPopup;