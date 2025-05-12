import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Href, Router, useRouter } from 'expo-router';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import BottomNavWave from './BottomNavWave';
import { useRole } from '../contexts/RoleContext';

type NavigationItem = {
    id: string;
    icon: string;
    route: Href;
};

export default function BottomNavigation() {
    const router: Router = useRouter();

    const { role } = useRole();
    const [navigations, setNavigations] = useState<NavigationItem[]>([]);
    useEffect(() => {
        setNavigations([
            { id: 'chat', icon: '💬', route: '/chats' },
            role === 'COACH'
                ? { id: 'addTraining', icon: '➕', route: '/trainings/create-training' }
                : { id: 'searchCoaches', icon: '🔍', route: '/search/search' },
            { id: 'home', icon: '🏠', route: '/home' },
            { id: 'viewSchedule', icon: '📅', route: '/trainings/upcoming-trainings' },
            { id: 'profile', icon: '👤', route: '/profile' },
        ]);
    }, [role]);

    const handleNavigation = (route: Href) => {
        router.push(route);
    };

    return (
        <BottomNavWave>
            {navigations.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => handleNavigation(item.route)}>
                    <Text style={{ fontSize: wp('8%'), color: '#fff' }}>{item.icon}</Text>
                </TouchableOpacity>
            ))}
        </BottomNavWave>
    );
}