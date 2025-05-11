import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Href, Router, useRouter } from 'expo-router';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import BottomNavWave from './BottomNavWave';
import {useTheme} from "@/src/contexts/ThemeContext";

type NavigationItem = {
    id: string;
    icon: string;
    route: Href;
};

export default function BottomNavigation() {
    const router: Router = useRouter();

    const navigationItems: NavigationItem[] = [
        { id: 'chat', icon: '💬', route: '/chats' },
        { id: 'searchCoaches', icon: '🔍', route: '/search/search' },
        { id: 'addTraining', icon: '➕', route: '/trainings/create-training' },
        { id: 'viewSchedule', icon: '📅', route: '/trainings/upcoming-trainings' },
        { id: 'profile', icon: '👤', route: '/profile' },
    ];

    const handleNavigation = (route: Href) => {
        router.push(route);

    };

    return (
        <BottomNavWave>
            {navigationItems.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => handleNavigation(item.route)}>
                    <Text style={{ fontSize: wp('8%'), color: '#fff' }}>{item.icon}</Text>
                </TouchableOpacity>
            ))}
        </BottomNavWave>
    );
}