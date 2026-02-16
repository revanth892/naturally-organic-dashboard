const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
    getPresignedUrl: (fileName: string, fileType: string, type?: string) =>
        api.get(`/media/presigned-url?fileName=${fileName}&fileType=${fileType}${type ? `&type=${type}` : ''}`),
};

export const cartActivityApi = {
    getAll: (userId?: string) => api.get(`/cart-activity/all${userId ? `?userId=${userId}` : ''}`),
};

export const productApi = {
    getAll: () => api.get("/products"),
    getAllWithParams: (params: string) => api.get(`/products${params}`),
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
    getAllWithParams: (params: string) => api.get(`/categories${params}`),
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

export const subcategoryApi = {
    getAll: (categoryId?: string) => api.get(`/subcategories${categoryId ? `?categoryId=${categoryId}` : ''}`),
    getAllWithParams: (params: string) => api.get(`/subcategories${params}`),
    getById: (id: string) => api.get(`/subcategories/${id}`),
    create: (data: any) => api.post("/subcategories", data),
    update: (id: string, data: any) => api.patch(`/subcategories/${id}`, data),
    delete: (id: string) => api.delete(`/subcategories/${id}`),
    updateSortOrder: (data: any) => api.patch("/subcategories/sort-order/update", data),
};

export const brandApi = {
    getAll: () => api.get("/brands"),
    getAllWithParams: (params: string) => api.get(`/brands${params}`),
    getById: (id: string) => api.get(`/brands/${id}`),
    create: (data: any) => api.post("/brands", data),
    update: (id: string, data: any) => api.put(`/brands/${id}`, data),
    delete: (id: string) => api.delete(`/brands/${id}`),
};

export const childCategoryApi = {
    getAll: (categoryId?: string, subcategoryId?: string) =>
        api.get(`/child-categories${categoryId ? `?categoryId=${categoryId}${subcategoryId ? `&subcategoryId=${subcategoryId}` : ''}` : subcategoryId ? `?subcategoryId=${subcategoryId}` : ''}`),
    getAllWithParams: (params: string) => api.get(`/child-categories${params}`),
    getById: (id: string) => api.get(`/child-categories/${id}`),
    create: (data: any) => api.post("/child-categories", data),
    update: (id: string, data: any) => api.put(`/child-categories/${id}`, data),
    delete: (id: string) => api.delete(`/child-categories/${id}`),
    updateSortOrder: (data: any) => api.put("/child-categories/sort-order", data),
};

export const storeApi = {
    getAll: () => api.get("/stores"),
    create: (data: any) => api.post("/stores", data),
    update: (id: string, data: any) => api.put(`/stores/${id}`, data),
    delete: (id: string) => api.delete(`/stores/${id}`),
};

export const faqApi = {
    getAll: () => api.get("/faqs"),
    create: (data: any) => api.post("/faqs", data),
    update: (id: string, data: any) => api.put(`/faqs/${id}`, data),
    delete: (id: string) => api.delete(`/faqs/${id}`),
};

export const postcodeApi = {
    getAll: () => api.get("/postcodes"),
    create: (data: any) => api.post("/postcodes", data),
    update: (id: string, data: any) => api.put(`/postcodes/${id}`, data),
    delete: (id: string) => api.delete(`/postcodes/${id}`),
};

