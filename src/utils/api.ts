import axios from 'axios';

// delete in the future
const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzQ1NTExMjk0LCJleHAiOjE3NDU4NzEyOTR9.2zAFxZJELvmGHjqHPPhCGd3w35YxbZ1JnIXvk2DdaVR4p4tmngiYollN0a23j0cy2VFA81UFtxxxxAeRSdahIg";

const api = axios.create({
  baseURL: 'http://147.175.161.225:8080/api',
  timeout: 10000,
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

api.interceptors.request.use(
  config => {
    if (token) 
        config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

export default api;