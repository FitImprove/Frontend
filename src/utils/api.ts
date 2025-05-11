import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Базовий URL для API
const BASE_URL = 'http://147.175.162.46:8080/api';

// Створюємо екземпляр для публічних запитів (без авторизації)
const publicApi = axios.create({
    baseURL: BASE_URL,
    timeout: 50000,
});

// Створюємо екземпляр для запитів зареєстрованих користувачів (з авторизацією)
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 50000,
});

// Функція для встановлення або видалення токена
export const setAuthToken = async (token: string) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await AsyncStorage.setItem('token', token);
    } else {
        delete api.defaults.headers.common['Authorization'];
        await AsyncStorage.removeItem('token');
    }
};

// Функція для завантаження токена з AsyncStorage при ініціалізації
const initializeAuthToken = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    } catch (error) {
        console.error('Error loading token from AsyncStorage:', error);
    }
};

// Ініціалізуємо токен при запуску
initializeAuthToken();

// Інтерсептор для api (з авторизацією)
api.interceptors.request.use(
    (config) => {
        return config; // Токен уже встановлений через setAuthToken або initializeAuthToken
    },
    (error) => Promise.reject(error)
);

// Інтерсептор для publicApi (без авторизації)
publicApi.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => Promise.reject(error)
);

type Role = 'USER' | 'COACH';
async function getRole(): Promise<Role|null> {
    switch (await AsyncStorage.getItem('role')) {
        case 'USER':
          return 'USER';
        case 'COACH':
          return 'COACH';
        default:
          return null;
    }
}

export { api, publicApi, BASE_URL, Role, getRole };