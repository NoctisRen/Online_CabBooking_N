// src/services/tripService.js - 改进错误处理
import api from './api';

export const tripService = {
  async createTrip(tripData) {
    try {
      console.log('发送行程创建请求:', tripData);
      const response = await api.post('/trip', tripData);
      console.log('行程创建响应:', response.data);
      return response.data;
    } catch (error) {
      console.error('行程创建错误详情:', error);
      throw this.handleTripError(error);
    }
  },

  // 其他方法保持不变...

  handleTripError(error) {
    if (error.response?.data) {
      const { message, fieldErrors } = error.response.data;
      
      console.log('后端返回的详细错误:', error.response.data);
      
      // 处理字段级验证错误
      if (fieldErrors) {
        const errorMessages = Object.values(fieldErrors).map(msg => 
          msg.replace(/{|}/g, '') // 移除花括号
        );
        return new Error(`验证失败: ${errorMessages.join(', ')}`);
      }
      
      return new Error(message || '行程操作失败');
    }
    
    return new Error('网络错误，请稍后重试');
  }
};