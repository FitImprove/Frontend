import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// delete in the future
const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIyIiwiaWF0IjoxNzQ1OTQ5NzA5LCJleHAiOjE3NDYzMDk3MDl9.T2zXinmkQ393civyM6pWEwGa-mI39EBXky0j4s6LDoGd55m4EY7e-b2cFbSKXDVn2CVMzDb5_QtlYjgRS8O3ZQ";

const api = axios.create({
  baseURL: 'http://172.20.10.2:8080/api',
  timeout: 10000,
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});
const publicApi = axios.create({
    baseURL: 'http://172.20.10.2:8080/api',
    timeout: 10000,
});
export const setAuthToken = async (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await AsyncStorage.setItem('token', token);
    } else {
        delete api.defaults.headers.common['Authorization'];
        await AsyncStorage.removeItem('token');
    }
};
api.interceptors.request.use(
  config => {
    if (token) 
        config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

export { publicApi, api };