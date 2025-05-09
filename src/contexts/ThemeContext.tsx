import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useContext, useEffect } from 'react';

const themes = {
    purple: {
        background: '#4A0074',
        text: '#FF1CC0',
        buttonBackground: '#B131FA',
        buttonText: '#4A0074',
        inputBackground: '#4A0074',
        inputText: '#FF1CC0',
        textOnElement: '#4A0074',
        inputBorder: '#FF1CC0',
        inputContainer: '#B131FA',
        borderColor: '#FF1CC0',
        accent: '#1C3AFF',
        gradient: ['#FF1CC0', '#1C3AFF'],
    },
    black: {
        background: '#2A003A',
        text: '#D633A0',
        buttonBackground: '#8A2EBF',
        buttonText: '#2A003A',
        inputBackground: '#2A003A',
        inputText: '#D633A0',
        textOnElement: '#2A003A',
        borderColor: '#D633A0',
        inputBorder: '#D633A0',
        inputContainer: '#8A2EBF',
        accent: '#4066FF',
        gradient: ['#D633A0', '#4066FF'],
    },
    contrast: {
        background: '#000000',
        text: '#FFFFFF',
        buttonBackground: '#B131FA',
        buttonText: '#000000',
        inputBackground: '#000000',
        inputText: '#FFFFFF',
        textOnElement: '#000000',
        borderColor: '#FFFFFF',
        inputBorder: '#FFFFFF',
        inputContainer: '#B131FA',
        accent: '#FFFFFF',
        gradient: ['#B131FA', '#FFFFFF'],
    },
};

const ThemeContext = createContext<any>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState('purple');

    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await AsyncStorage.getItem('theme');
            if (savedTheme) setCurrentTheme(savedTheme);
        };
        loadTheme();
    }, []);

    const toggleTheme = async (themeName: string) => {
        setCurrentTheme(themeName);
        await AsyncStorage.setItem('theme', themeName);
    };

    return (
        <ThemeContext.Provider value={{ theme: themes[currentTheme], toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);