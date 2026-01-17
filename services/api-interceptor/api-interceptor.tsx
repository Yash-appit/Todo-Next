// import appConfig from "../../config/index";

// eslint-disable-next-line eqeqeq
// const DEBUG = appConfig().ENV_TYPE == "DEV";

const errorInterceptor = (axiosInstance: any) => {
  axiosInstance.interceptors.response.use(
    (response: any) => {
      // Response Successful
      return response;
    },
    async (error: any) => {
      // Default error message
      let errorMessage = "Internal Server Error";

      // Handle blob response errors
      if (error.config?.responseType === 'blob') {
        const blob = error.response?.data;
        if (blob instanceof Blob) {
          try {
            const text = await blob.text();
            if (text) {
              try {
                const errorJson = JSON.parse(text);
                errorMessage = errorJson?.message || errorMessage;
              } catch {
                errorMessage = text || errorMessage;
              }
            }
            return Promise.reject(errorMessage);
          } catch (parseError) {
            console.error("Failed to parse error response:", parseError);
          }
        }
      }

      // Check for different error response formats
      if (error?.response?.data) {
        // Handle JSON response
        if (typeof error.response.data === 'object') {
          errorMessage = error.response.data.code || 
                        error.response.data.message || 
                        error.response.data.error || 
                        errorMessage;
        } 
        // Handle string response
        else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data || errorMessage;
        }
      } 
      // Handle cases where there's no response (network errors, etc.)
      else if (!error.response) {
        if (error.message === "Network Error") {
          errorMessage = "Network Error: Please check your internet connection";
        } else {
          errorMessage = "Server is not responding. Please try again later.";
        }
      }

      // Handle HTTP status codes
      if (error?.response?.status) {
        switch (error.response.status) {
          case 400:
            errorMessage = errorMessage || "Bad Request";
            break;
          case 401:
            // Unauthorized
            window.location.href = "/";
            localStorage.removeItem("token");
            errorMessage = "Unauthorized access. Please log in.";
            break;
          case 403:
            errorMessage = "Forbidden: You don't have permission for this action";
            break;
          case 404:
            errorMessage = "Resource not found";
            break;
          case 500:
            errorMessage = "Internal Server Error";
            break;
          case 502:
            errorMessage = "Bad Gateway";
            break;
          case 503:
            errorMessage = "Service Unavailable";
            break;
          case 504:
            errorMessage = "Gateway Timeout";
            break;
          default:
            errorMessage = `Request failed with status code ${error.response.status}`;
        }
      }

      return Promise.reject(errorMessage);
    }
  );
};


  const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

const updateHeaderInterceptor = (axiosInstance: any) => {
  axiosInstance.interceptors.request.use(
    (config: any) => {
      const jwtToken = getFromLocalStorage("token");
      // console.log("jwtToken", jwtToken);
      if (jwtToken) {
        config.headers["Authorization"] = "Bearer " + jwtToken;
      }
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );
};

export { errorInterceptor, updateHeaderInterceptor };





// src/api-interceptor.tsx

// import axios from 'axios';
// import { API_BASE_URL } from '../../config';

// // Create an Axios instance
// const apiClient = axios.create({
//   baseURL: API_BASE_URL, // Base URL from .env
//   timeout: 10000, // Request timeout
// });

// // Request interceptor
// apiClient.interceptors.request.use(
//   (config) => {
//     // Add Authorization header or other custom logic
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle errors globally
//     if (error.response && error.response.status === 401) {
//       // Handle unauthorized access
//       window.location.href = "/";
//     }
//     return Promise.reject(error);
//   }
// );

// export default apiClient;
