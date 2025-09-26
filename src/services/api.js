import axios from "axios";

// Cấu hình base URL từ environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_TIMEOUT = process.env.REACT_APP_API_TIMEOUT || 10000;

// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để thêm token vào header (nếu có)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response và error
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn, redirect về login
      localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API Services
export const apiService = {
  // GET request
  get: async (endpoint) => {
    try {
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST request
  post: async (endpoint, data) => {
    try {
      const response = await apiClient.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  put: async (endpoint, data = null) => {
    try {
      const response = await apiClient.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  delete: async (endpoint) => {
    try {
      const response = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload file
  uploadFile: async (endpoint, formData) => {
    try {
      const response = await apiClient.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const dashboardAPI = {
  getRecentActivities: () => apiService.get("/dashboard/recent-activities"),
  getOverview: () => apiService.get("/dashboard/overview"),
  getContentStatistics: () => apiService.get("/dashboard/content-statistics"),
  getContactAnalysis: () => apiService.get("/dashboard/contact-analysis"),
};

// Admin specific API calls
export const adminAPI = {
  // Auth
  login: (credentials) => apiService.post("/login", credentials),
  logout: () => apiService.post("/logout"),
  getProfile: () => apiService.get("/profile"),

  // Dashboard stats
  getDashboardStats: () => apiService.get("/dashboard/stats"),
};

// Contact API for admin
export const contactAPI = {
  getAll: (params) => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    return apiService.get(`/contacts${queryString}`);
  },
  getById: (id) => apiService.get(`/contacts/${id}`),
  create: (data) => apiService.post("/contacts", data),
  update: (id, data) => apiService.put(`/contacts/${id}`, data),
  delete: (id) => apiService.delete(`/contacts/${id}`),
  updateStatus: (id, status) => {
    const params = new URLSearchParams({ status });
    return apiService.put(`/contacts/${id}/status?${params.toString()}`, {});
  },
  updateNote: (id, note) => {
    const params = new URLSearchParams({ note });
    return apiService.put(`/contacts/${id}/note?${params.toString()}`, {});
  },
  updateHandled: (id, handleBy, handledAt) => {
    const params = new URLSearchParams({
      handleBy: handleBy.toString(),
      handledAt,
    });
    return apiService.put(`/contacts/${id}/handled?${params.toString()}`, {});
  },
  markAsRead: (id) => apiService.put(`/contacts/${id}/read`),
  markAsUnread: (id) => apiService.put(`/contacts/${id}/unread`),
};

// Project API for admin
export const projectAPI = {
  getAll: (params) => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    return apiService.get(`/projects${queryString}`);
  },
  getById: (id) => apiService.get(`/projects/${id}`),
  create: (data) => apiService.post("/projects", data),
  update: (id, data) => apiService.put(`/projects/${id}`, data),
  delete: (id) => apiService.delete(`/projects/${id}`),
  updateStatus: (id, status) =>
    apiService.put(`/projects/${id}/status`, { status }),
  uploadImages: (id, formData) =>
    apiService.uploadFile(`/projects/${id}/images`, formData),
  deleteImage: (projectId, imageId) =>
    apiService.delete(`/projects/${projectId}/images/${imageId}`),
};

// Service API for admin
export const serviceAPI = {
  getAll: (params) => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    return apiService.get(`/services${queryString}`);
  },
  getById: (id) => apiService.get(`/services/${id}`),
  create: (data) => apiService.post("/services", data),
  update: (id, data) => apiService.put(`/services/${id}`, data),
  delete: (id) => apiService.delete(`/services/${id}`),
  updateStatus: (id, status) =>
    apiService.put(`/services/${id}/status`, { status }),
};

// Blog API for admin
export const blogAPI = {
  getAll: (params) => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    return apiService.get(`/blogs${queryString}`);
  },
  getById: (id) => apiService.get(`/blogs/${id}`),
  create: (data) => apiService.post("/blogs", data),
  update: (id, data) => apiService.put(`/blogs/${id}`, data),
  delete: (id) => apiService.delete(`/blogs/${id}`),
  updateStatus: (id, status) =>
    apiService.put(`/blogs/${id}/status`, { status }),
};

// User API for admin
export const userAPI = {
  getAll: (params) => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    return apiService.get(`/users${queryString}`);
  },
  getById: (id) => apiService.get(`/users/${id}`),
  create: (data) => apiService.post("/users", data),
  update: (id, data) => apiService.put(`/users/${id}`, data),
  delete: (id) => apiService.delete(`/users/${id}`),
  updateRole: (id, role) => apiService.put(`/users/${id}/role`, { role }),
  resetPassword: (id) => apiService.post(`/users/${id}/reset-password`),
};

// File Upload API
export const fileAPI = {
  // Upload single image for CKEditor
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("upload", file);
    return apiService.uploadFile("/files/upload", formData);
  },

  // Upload multiple images
  uploadImages: (files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images`, file);
    });
    return apiService.uploadFile("/files/upload/multiple", formData);
  },

  // Delete uploaded file
  deleteFile: (fileId) => apiService.delete(`/files/${fileId}`),
};

export default apiService;
