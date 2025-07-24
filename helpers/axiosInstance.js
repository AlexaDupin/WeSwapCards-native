import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.BASE_URL, // Set the base URL for your API
});

export { axiosInstance };
