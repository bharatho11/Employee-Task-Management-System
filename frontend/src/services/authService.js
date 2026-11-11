import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Axios instance for all API requests
const api = axios.create({
    baseURL: API_URL
});

// Attach JWT token automatically to protected requests
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Employee Login
export const loginUser = async (credentials) => {
    const response = await api.post(
        '/auth/login',
        credentials
    );

    return response.data;
};

export const registerUser = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

// Get Employee Dashboard Statistics
export const getEmployeeDashboard = async () => {
    const response = await api.get('/employee/dashboard');

    return response.data;
};

// Get Employee Assigned Tasks
export const getEmployeeTasks = async () => {
    const response = await api.get('/employee/tasks');

    return response.data;
};

// Update Employee Task Status
export const updateTaskStatus = async (taskId, status) => {
    const response = await api.put(
        `/employee/tasks/${taskId}/status`,
        { status }
    );

    return response.data;
};

export const getManagerDashboard = async () => {
    const response = await api.get('/manager/dashboard');
    return response.data;
};
export const getManagerEmployees = async () => {
    const response = await api.get('/manager/employees');
    return response.data;
};

export const createManagerTask = async (taskData) => {
    const response = await api.post('/manager/tasks', taskData);
    return response.data;
};
export const getManagerTasks = async () => {
    const response = await api.get('/manager/tasks');
    return response.data;
};

// Get manager notifications
export const getManagerNotifications = async () => {
    const response = await api.get('/manager/notifications');
    return response.data;
};

// Mark manager notification as read
export const markManagerNotificationAsRead = async (notificationId) => {
    const response = await api.put(
        `/manager/notifications/${notificationId}/read`
    );
    return response.data;
};