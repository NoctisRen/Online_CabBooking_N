// src/services/customerService.js - 更新版本
import api from './api';

export const customerService = {
  // 客户注册
  async register(customerData) {
    try {
      console.log('发送注册请求:', customerData);
      const response = await api.post('/save', customerData);
      console.log('注册响应:', response.data);
      return response.data;
    } catch (error) {
      console.error('注册错误:', error);
      throw this.handleCustomerError(error);
    }
  },

  // 获取客户信息
  async getCustomer(id) {
    try {
      const response = await api.get(`/customer/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleCustomerError(error);
    }
  },

  // 更新客户信息
  async updateCustomer(id, customerData) {
    try {
      const response = await api.put(`/update/${id}`, customerData);
      return response.data;
    } catch (error) {
      throw this.handleCustomerError(error);
    }
  },

  // 获取所有客户
  async getAllCustomers() {
    try {
      const response = await api.get('/customers');
      return response.data;
    } catch (error) {
      throw this.handleCustomerError(error);
    }
  },

  // 通过邮箱密码验证客户
  async validateCustomer(email, password) {
    try {
      const response = await api.get(`/customer/${email}/${password}`);
      return response.data;
    } catch (error) {
      throw this.handleCustomerError(error);
    }
  },

  // 错误处理
  handleCustomerError(error) {
    if (error.response?.data) {
      const { message, fieldErrors } = error.response.data;
      if (fieldErrors) {
        return new Error(Object.values(fieldErrors).join(', '));
      }
      return new Error(message || '操作失败');
    }
    return new Error('网络错误，请稍后重试');
  }
};