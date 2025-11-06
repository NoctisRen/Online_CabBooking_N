// src/services/api.js - 完整版本
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8989';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器来调试
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器来调试
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// 用户认证相关API
export const authAPI = {
  // 用户登录
  login: (userData) => api.post('/login', userData),
  
  // 用户注销
  logout: (key) => api.patch('/logout', null, { params: { key } }),
  
  // 注册客户 - 修复数据格式
  registerCustomer: (customerData) => {
    // 确保数据格式与后端实体匹配
    const formattedData = {
      username: customerData.username,
      password: customerData.password,
      mobile: customerData.mobile,
      email: customerData.email,
      address: customerData.address
    };
    console.log('Sending registration data:', formattedData);
    return api.post('/save', formattedData);
  },
};

// 客户相关API
export const customerAPI = {
  // 获取客户信息
  getCustomer: (id) => api.get(`/customer/${id}`),
  
  // 更新客户信息
  updateCustomer: (id, customerData) => api.put(`/update/${id}`, customerData),
  
  // 创建行程
  createTrip: (tripData) => api.post('/trip', tripData),
  
  // 获取所有行程
  getAllTrips: () => api.get('/trips'),
  
  // 结束行程
  endTrip: (id) => api.patch(`/tripend/${id}`),
  
  // 验证客户
  validCustomer: (email, password) => api.get(`/customer/${email}/${password}`),
};

// 司机相关API
export const driverAPI = {
  // 注册司机
  registerDriver: (driverData) => api.post('/drivers', driverData),
  
  // 获取司机信息
  getDriver: (id) => api.get(`/drivers/${id}`),
  
  // 更新司机状态
  updateDriver: (id, license, available) => 
    api.put('/drivers', null, { params: { id, lic: license, avail: available } }),
  
  // 获取优秀司机
  getBestDrivers: () => api.get('/topDrivers'),
  
  // 获取可用司机
  getAvailableDrivers: () => api.get('/drivers/available'),
};

// 出租车相关API
export const cabAPI = {
  // 获取可用出租车类型
  getCabTypes: () => api.get('/cabs'),
  
  // 获取出租车数量
  getCabCount: () => api.get('/cabsCount'),
  
  // 更新出租车信息
  updateCab: (id, type, rate) => 
    api.put('/cabs', null, { params: { id, type, rate } }),
};

// 管理员相关API
export const adminAPI = {
  // 创建管理员
  createAdmin: (adminData) => api.post('/admin/', adminData),
  
  // 更新管理员
  updateAdmin: (adminData) => api.put('/admin/', adminData),
  
  // 删除管理员
  deleteAdmin: (id) => api.delete(`/admin/${id}`),
  
  // 获取客户的所有行程
  getCustomerTrips: (customerId) => api.get(`/admin/trips/${customerId}`),
  
  // 按司机获取行程
  getTripsDriverwise: () => api.get('/admin/trips/driverwise'),
  
  // 按客户获取行程
  getTripsCustomerwise: () => api.get('/admin/customertrips'),
  
  // 按日期获取行程
  getTripsDatewise: () => api.get('/admin/datewisetrips'),
  
  // 按客户和日期获取行程
  getTripsByCustomerAndDate: (customerId, date) => 
    api.get(`/admin/trips/${customerId}/${date}`),
};

// 行程相关API
export const tripAPI = {
  // 获取所有行程
  getAllTrips: () => api.get('/trips'),
  
  // 创建行程
  createTrip: (tripData) => api.post('/trip', tripData),
  
  // 更新行程
  updateTrip: (id, tripData) => api.put(`/tripupdate/${id}`, tripData),
  
  // 删除行程
  deleteTrip: (id) => api.delete(`/tripdelete/${id}`),
  
  // 结束行程
  endTrip: (id) => api.patch(`/tripend/${id}`),
};

export default api;