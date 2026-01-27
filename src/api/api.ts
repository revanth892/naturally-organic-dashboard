const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const api = {
    post: async (endpoint: string, data: any) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || result.error || "Something went wrong");
        }
        return result;
    },

    get: async (endpoint: string) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || result.error || "Something went wrong");
        }
        return result;
    },

    patch: async (endpoint: string, data: any) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || result.error || "Something went wrong");
        }
        return result;
    },

    put: async (endpoint: string, data: any) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || result.error || "Something went wrong");
        }
        return result;
    },

    delete: async (endpoint: string) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || result.error || "Something went wrong");
        }
        return result;
    },
};

export const authApi = {
    login: (credentials: any) => api.post("/users/login", credentials),
};

export const userApi = {
    getAll: () => api.get("/users"),
    create: (data: any) => api.post("/users", data),
    updatePermissions: (id: string, permissions: any) => api.patch(`/users/${id}/permissions`, permissions),
    toggleStatus: (id: string) => api.patch(`/users/${id}/toggle-status`, {}),
    resetPassword: (id: string, data: any) => api.patch(`/users/${id}/reset-password`, data),
};

export const appUserApi = {
    getAll: () => api.get("/app-users"),
    getById: (id: string) => api.get(`/app-users/${id}`),
    updateByAdmin: (id: string, data: any) => api.patch(`/app-users/${id}`, data),
    getHistory: (id: string) => api.get(`/app-users/${id}/history`),
    updateLeadTracking: (id: string, data: any) => api.patch(`/app-users/${id}/lead-tracking`, data),
};

export const mediaApi = {
    getPresignedUrl: (fileName: string, fileType: string) =>
        api.get(`/media/presigned-url?fileName=${fileName}&fileType=${fileType}`),
};

export const productApi = {
    getAll: () => api.get("/products"),
    getById: (id: string) => api.get(`/products/${id}`),
    create: (data: any) => api.post("/products", data),
    update: (id: string, data: any) => api.patch(`/products/${id}`, data),
    softDelete: (id: string) => api.patch(`/products/${id}/soft-delete`, {}),
    addVariant: (productId: string, data: any) => api.post(`/products/${productId}/variants`, data),
    updateVariant: (productId: string, variantId: string, data: any) => api.patch(`/products/${productId}/variants/${variantId}`, data),
    deleteVariant: (productId: string, variantId: string) => api.delete(`/products/${productId}/variants/${variantId}`),
};

export const categoryApi = {
    getAll: () => api.get("/categories"),
    create: (data: any) => api.post("/categories", data),
    update: (id: string, data: any) => api.put(`/categories/${id}`, data),
    delete: (id: string) => api.delete(`/categories/${id}`),
};

export const couponApi = {
    getAll: () => api.get("/coupons"),
    getById: (id: string) => api.get(`/coupons/${id}`),
    create: (data: any) => api.post("/coupons", data),
    update: (id: string, data: any) => api.patch(`/coupons/${id}`, data),
    delete: (id: string) => api.delete(`/coupons/${id}`),
};
