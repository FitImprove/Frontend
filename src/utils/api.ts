import axios from 'axios';

// delete in the future
const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0IiwiaWF0IjoxNzQ2Mjk2NDE4LCJleHAiOjE3NDY2NTY0MTh9.Nkt35ReHj48hk1VJZsXrT_SFYo73Ptyz5irKKipyWgUJnNGwdiFLTizY1jKh8RqV33cTvc3bFjbd_tGvGfOdJw";

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