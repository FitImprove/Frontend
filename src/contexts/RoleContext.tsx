import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getRole, Role } from '../utils/api';
import { useFocusEffect } from 'expo-router';

const RoleContext = createContext<any>(null);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [role, _setRole] = useState<Role>('USER');

    useFocusEffect(
        useCallback(() => {
            const loadRole = async () => {
                switch (await AsyncStorage.getItem('role')) {
                case 'USER':
                    _setRole('USER');
                    break;
                case 'COACH':
                    _setRole('COACH');
                    break;
                default: return null;
                }
            };
            loadRole();
            return () => {};
        }, [])
    );

    async function setRole(role: Role) {
        _setRole(role);
        await AsyncStorage.setItem('role', role);
    }

    return (
        <RoleContext.Provider value={{ role, setRole }}>
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => useContext(RoleContext);