import axios from 'axios';

const baseURL = process.env.EXPO_PUBLIC_BASE_URL;

const axiosInstance = axios.create(baseURL ? { baseURL } : {});

export { axiosInstance };
