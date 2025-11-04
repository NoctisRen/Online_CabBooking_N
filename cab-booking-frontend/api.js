// API服务配置
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8989';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userType');
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
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
    // 确保数据格式符合后端期望
    const formattedData = {
      username: customerData.username,
      password: customerData.password,
      mobile: customerData.mobile,
      email: customerData.email,
      address: customerData.address
    };
    return api.post('/save', formattedData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
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
};

// 出租车相关API
export const cabAPI = {
  // 获取可用出租车类型
  getCabTypes: () => api.get('/cabs'),
  
  // 获取出租车数量
  getCabCount: () => api.get('/cabsCount'),
};

// 管理员相关API
export const adminAPI = {
  // 获取所有行程（按不同方式排序）
  getAllTrips: (customerId) => api.get(`/admin/trips/${customerId}`),
  getTripsDriverwise: () => api.get('/admin/trips/driverwise'),
  getTripsCustomerwise: () => api.get('/admin/customertrips'),
  getTripsDatewise: () => api.get('/admin/datewisetrips'),
};

export default api;