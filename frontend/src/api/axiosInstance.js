import axios from "axios";
import {notifyError} from "../utils/errorHandler";


const API_BASE_URL = import.meta.enve.VITE_API_URL || "http://localhost:8081";

let refreshAttempts = 0;

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

//Request interceptor
axiosInstance.interceptors.request.use(
    config => config,
    error => {
        notifyError(error);//function call
        return Promise.reject(error);
    }
);

//Response interceptor
axiosInstance.interceptors.response.use(
    response => response,
    async(error) => {
        const original = error.config;
        //prevent infinite refresh loop
        if(original.url.includes("/api/auth/refresh")){
            return Promise.reject(error);
        }

        //if 401 Unauthorized (access token is probably expired), retry
        if(error.response?.status === 401 && refreshAttempts < 2){
            refreshAttempts++;
            try{
                await axiosInstance.post("/api/auth/refresh");
                return axiosInstance(original);
            }catch(refreshError){
                notifyError(refreshError);
                return Promise.reject(refreshError);
            }
        }

        notifyError(error);
        return Promise.reject(error);
    }
);

export default axiosInstance;