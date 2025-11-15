// src/services/driverService.js - 紧急修复版本
import api from './api';

export const driverService = {
  // 司机注册
  async register(driverData) {
    try {
      console.log('发送司机注册请求:', driverData);
      const response = await api.post('/drivers', driverData);
      console.log('司机注册响应:', response.data);
      return response.data;
    } catch (error) {
      console.error('司机注册错误:', error.response?.data || error);
      throw this.handleDriverError(error);
    }
  },

  // 获取司机信息
  async getDriver(id) {
    try {
      const response = await api.get(`/drivers/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleDriverError(error);
    }
  },

  // 更新司机信息
  async updateDriver(id, license, available) {
    try {
      console.log('更新司机状态:', { id, license, available });
      const response = await api.put(`/drivers?id=${id}&lic=${license}&avail=${available}`);
      console.log('司机状态更新响应:', response.data);
      return response.data;
    } catch (error) {
      console.error('更新司机状态失败:', error);
      throw this.handleDriverError(error);
    }
  },

  // 获取最佳司机列表 - 紧急修复：直接返回空数组避免错误
  async getBestDrivers() {
    try {
      console.log('尝试获取高评分司机...');
      const response = await api.get('/topDrivers');
      const drivers = response.data;
      console.log('获取到的高评分司机:', drivers);
      
      // 统一字段名处理
      const normalizedDrivers = drivers.map(driver => ({
        userId: driver.userId || driver.driverId,
        username: driver.username || driver.Username,
        mobile: driver.mobile || driver.Mobile,
        email: driver.email || driver.Email,
        licenseNo: driver.licenseNo,
        rating: driver.rating,
        available: driver.available,
        cab: driver.cab ? {
          cabId: driver.cab.cabId,
          carType: driver.cab.carType,
          ratePerKm: driver.cab.ratePerKm
        } : null,
        address: driver.address
      }));
      
      return normalizedDrivers;
    } catch (error) {
      console.warn('获取高评分司机失败，返回空数组:', error.message);
      // 紧急修复：直接返回空数组，避免页面崩溃
      return [];
    }
  },

  // 获取所有司机 - 临时解决方案
  async getAllDrivers() {
    try {
      // 临时返回一些模拟数据用于测试
      console.log('获取所有司机 - 返回模拟数据');
      return [
        {
          userId: 133,
          username: '测试司机',
          mobile: '13800138000',
          email: 'driver@test.com',
          licenseNo: 'TEST12345678',
          rating: 5.0,
          available: true,
          cab: {
            cabId: 1,
            carType: '经济型',
            ratePerKm: 10
          }
        }
      ];
    } catch (error) {
      console.error('获取所有司机失败:', error);
      return [];
    }
  },

  // 错误处理
  handleDriverError(error) {
    if (error.response?.data) {
      const { message, fieldErrors } = error.response.data;
      
      // 处理字段级错误
      if (fieldErrors) {
        const errorMessages = Object.values(fieldErrors).join(', ');
        return new Error(`验证失败: ${errorMessages}`);
      }
      
      // 处理全局错误消息
      if (message) {
        return new Error(message);
      }
      
      // 处理其他错误响应格式
      if (typeof error.response.data === 'string') {
        return new Error(error.response.data);
      }
    }
    
    // 网络错误或其他未知错误
    return new Error('网络错误，请稍后重试');
  }
};