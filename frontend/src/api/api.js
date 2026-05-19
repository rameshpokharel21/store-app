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

    // Profile
    updateProfile: async (data) => {
        const response = await axiosInstance.put("/api/user/profile", data);
        return response.data;
    },

    // Categories
    getCategories: async () => {
        const response = await axiosInstance.get("/api/categories");
        return response.data;
    },
    createCategory: async (data) => {
        const response = await axiosInstance.post("/api/categories", data);
        return response.data;
    },
    deleteCategory: async (id) => {
        const response = await axiosInstance.delete(`/api/categories/${id}`);
        return response.data;
    },

    // Products
    getProducts: async (params) => {
        const response = await axiosInstance.get("/api/products", { params });
        return response.data;
    },
    createProduct: async (data) => {
        const response = await axiosInstance.post("/api/products", data);
        return response.data;
    },
    updateProduct: async (id, data) => {
        const response = await axiosInstance.put(`/api/products/${id}`, data);
        return response.data;
    },
    deleteProduct: async (id) => {
        const response = await axiosInstance.delete(`/api/products/${id}`);
        return response.data;
    },

    // Suppliers
    getSuppliers: async () => {
        const response = await axiosInstance.get("/api/suppliers");
        return response.data;
    },
    createSupplier: async (data) => {
        const response = await axiosInstance.post("/api/suppliers", data);
        return response.data;
    },
    updateSupplier: async (id, data) => {
        const response = await axiosInstance.put(`/api/suppliers/${id}`, data);
        return response.data;
    },
    deleteSupplier: async (id) => {
        const response = await axiosInstance.delete(`/api/suppliers/${id}`);
        return response.data;
    },

    // Purchase Orders
    getPurchaseOrders: async (params) => {
        const response = await axiosInstance.get("/api/purchase-orders", { params });
        return response.data;
    },
    createPurchaseOrder: async (data) => {
        const response = await axiosInstance.post("/api/purchase-orders", data);
        return response.data;
    },
    receiveShipment: async (poId, data) => {
        const response = await axiosInstance.put(`/api/purchase-orders/${poId}/receive`, data);
        return response.data;
    },

    // Inventory Adjustments
    getAdjustments: async (params) => {
        const response = await axiosInstance.get("/api/inventory/adjustments", { params });
        return response.data;
    },
    createAdjustment: async (data) => {
        const response = await axiosInstance.post("/api/inventory/adjustments", data);
        return response.data;
    },

    // Reports
    getLowStock: async () => {
        const response = await axiosInstance.get("/api/reports/low-stock");
        return response.data;
    },
    getSalesSummary: async (start, end) => {
        const response = await axiosInstance.get("/api/reports/sales-summary", { params: { start, end } });
        return response.data;
    },
    getShrinkageReport: async () => {
        const response = await axiosInstance.get("/api/reports/shrinkage");
        return response.data;
    },

};