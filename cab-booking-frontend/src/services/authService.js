// src/services/authService.js - 更新版本
import api from './api';

export const authService = {
  // 用户登录
  async login(loginData) {
    try {
      const response = await api.post('/login', loginData);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  },

  // 司机登录（可能需要单独的司机登录接口）
  async driverLogin(loginData) {
    try {
      // 如果没有单独的司机登录接口，可以尝试使用客户登录接口
      // 因为司机和客户都继承自AbstractUser，可能有相同的登录逻辑
      const response = await api.post('/login', loginData);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  },

  // 用户登出
  async logout(key) {
    try {
      const response = await api.patch('/logout', null, {
        params: { key }
      });
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  },

  // 错误处理
  handleAuthError(error) {
    if (error.response?.data) {
      const { message, fieldErrors } = error.response.data;
      if (fieldErrors) {
        return new Error(Object.values(fieldErrors).join(', '));
      }
      return new Error(message || '认证失败');
    }
    return new Error('网络错误，请稍后重试');
  }
};