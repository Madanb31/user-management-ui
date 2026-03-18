import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8080'
});

// This runs BEFORE every API call
// Automatically adds token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ====== AUTH APIs ======
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);

// ====== USER APIs ======
export const getAllUsers = () => API.get('/users');
export const getUserById = (id) => API.get(`/users/${id}`);
export const searchUsersByName = (name) => API.get(`/users/name/${name}`);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);

// Paginated
export const getUsersPaginated = (page, size, sortBy, direction) =>
    API.get(`/users/page/sort?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`);

// Role assignment
export const assignRole = (userId, roleId) => API.put(`/users/${userId}/roles/${roleId}`);
export const removeRole = (userId, roleId) => API.delete(`/users/${userId}/roles/${roleId}`);

// ====== ROLE APIs ======
export const getAllRoles = () => API.get('/roles');
export const getRoleById = (id) => API.get(`/roles/${id}`);
export const createRole = (data) => API.post('/roles', data);

// ====== HITL APIs (Admin only) ======
export const getHitlActionsByStatus = (status = "PENDING") =>
  API.get(`/hitl/actions?status=${status}`);

export const approveHitlAction = (id, reason = "") =>
  API.post(`/hitl/actions/${id}/approve`, reason ? { reason } : {});

export const rejectHitlAction = (id, reason = "") =>
  API.post(`/hitl/actions/${id}/reject`, reason ? { reason } : {});


//chat memory
export const getChatHistory = (chatId) => API.get(`/ai/history?chatId=${chatId}`);