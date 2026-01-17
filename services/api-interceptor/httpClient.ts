import axios from 'axios';
import { errorInterceptor, updateHeaderInterceptor } from './api-interceptor';
import { API_BASE_URL } from '@/config/index';


// Create an instance of Axios with a base URL from appConfig
const httpClient = axios.create({
  baseURL: API_BASE_URL,
});

// Apply error interceptor to handle errors globally
errorInterceptor(httpClient);

// Apply header interceptor to update headers before requests are sent
updateHeaderInterceptor(httpClient);

export default httpClient;
