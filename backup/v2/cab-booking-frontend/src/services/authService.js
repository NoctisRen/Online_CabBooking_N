// src/services/authService.js
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