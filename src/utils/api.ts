import axios from 'axios';

// delete in the future
const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzQ2NzkyMjA5LCJleHAiOjE3NDcxNTIyMDl9.firDavRspIljkGgj661LTtSVGzb9_c-F6805UsDNQsWB6Rps_n4wAH3ZMYlIZ_9IJqsIDDonUcqyZpcVrgUBKQ";

export const apiURL = 'http://192.168.137.1:8080/api'

const api = axios.create({
  baseURL: apiURL,
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