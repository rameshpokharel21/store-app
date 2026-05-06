import axiosInstance from "./axiosInstance"


export const api = {

    //Login
    login: async (credentials) => {
        const response = await axiosInstance.post("/api/auth/login", credentials);
        return response.data;
    },

    //register
    register: async (userData) => {
        const response = await axiosInstance.post("/api/auth/register", userData);
        return response.data;
    },

    //logout
    logout: async () => {
        const response = await axiosInstance.post("/api/auth/logout");
        return response.data;
    },

    //get current user
    getCurrentUser: async () => {
        const response = await axiosInstance.get("/api/user/me");
        return response.data;
    },

    //refresh token
    refreshToken: async () => {
        const response = await axiosInstance.post("/api/auth/refresh");
        return response.data;
    },

    //get user profile
    getProfile: async () => {
        const response = await axiosInstance.get("/api/user/profile");
        return response.data;
    },

    //get all users
    getAllUsers: async () => {
        const response = await axiosInstance.get("/api/admin/users");
        return response.data;
    },

    getDashboard: async () => {
        const response = await axiosInstance.get("/api/dashboard");
        return response.data;
    },

    // Admin: user management
    getUserById: async (id) => {
        const response = await axiosInstance.get(`/api/admin/users/${id}`);
        return response.data;
    },

    createUser: async (data) => {
        const response = await axiosInstance.post("/api/admin/users", data);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await axiosInstance.delete(`/api/admin/users/${id}`);
        return response.data;
    },

    updateUserRoles: async (id, roles) => {
        const response = await axiosInstance.put(`/api/admin/users/${id}/roles`, { roles });
        return response.data;
    },

    updateUserEnabled: async (id, enabled) => {
        const response = await axiosInstance.put(`/api/admin/users/${id}/enabled`, { enabled });
        return response.data;
    },

};