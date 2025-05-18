import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Href, Router, useRouter } from 'expo-router';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import BottomNavWave from './BottomNavWave';
import { useRole } from '../contexts/RoleContext';

/**
 * Represents a navigation item in the bottom navigation bar
 * @interface NavigationItem
 */
interface NavigationItem {
    /**
     * Unique identifier for the navigation item
     */
    id: string;
    /**
     * Icon to display for the navigation item
     */
    icon: string;
    /**
     * Route to navigate to when the item is pressed
     */
    route: Href;
}

/**
 * A component that renders a bottom navigation bar with role-based navigation items
 * @returns {JSX.Element} The rendered bottom navigation bar
 */
export default function BottomNavigation() {
    const router: Router = useRouter();
    const { role } = useRole();
    const [navigations, setNavigations] = useState<NavigationItem[]>([]);

    /**
     * Updates navigation items based on the user's role
     */
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

    /**
     * Handles navigation to the specified route
     * @param route - The route to navigate to
     */
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