import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const BASE_API = '147.175.162.46:8080';
const BASE_URL = `http://${BASE_API}/api`;

const publicApi = axios.create({
    baseURL: BASE_URL,
    timeout: 50000,
});

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 50000,
});

export const setAuthToken = async (token: string) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await AsyncStorage.setItem('token', token);
    } else {
        delete api.defaults.headers.common['Authorization'];
        await AsyncStorage.removeItem('token');
    }
};

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

initializeAuthToken();

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => Promise.reject(error)
);


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
export const getBaseApi = (): string => BASE_API;
export { api, publicApi, BASE_URL, Role, getRole };