import axios from 'axios';

const api = axios.create({
	baseURL: process.env.REACT_APP_URL_TOKEN
});

export default api;
