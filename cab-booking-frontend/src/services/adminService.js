// src/services/adminService.js - 更新示例数据
import api from './api';

export const adminService = {
  // 获取统计数据
  async getStats() {
    try {
      // 这里调用后端管理员API获取统计数据
      // 暂时返回模拟数据
      return {
        totalCustomers: 24, // 根据数据库中的25条记录减去管理员
        totalDrivers: 8,    // 假设有8个司机
        totalTrips: 47,     // 假设总行程数
        activeTrips: 3,     // 进行中的行程
        todayRevenue: 5680  // 今日收入
      };
    } catch (error) {
      console.error('获取统计数据失败:', error);
      throw error;
    }
  },

  // 获取最近行程 - 更新示例数据
  async getRecentTrips() {
    try {
      // 使用已知用户和新的出发地/目的地
      return [
        {
          id: 'TR001234',
          customerName: 'LiuJiahao',
          customerId: 1,
          driverName: '李师傅',
          driverId: 133,
          route: '111 → 222',
          amount: 156,
          status: 'completed',
          fromLocation: '111',
          toLocation: '222'
        },
        {
          id: 'TR001235',
          customerName: 'HXW666',
          customerId: 30,
          driverName: '赵师傅',
          driverId: 146,
          route: '111 → 222',
          amount: 89,
          status: 'active',
          fromLocation: '111',
          toLocation: '222'
        },
        {
          id: 'TR001236',
          customerName: 'TWQ666',
          customerId: 61,
          driverName: '陈师傅',
          driverId: 148,
          route: '111 → 222',
          amount: 67,
          status: 'completed',
          fromLocation: '111',
          toLocation: '222'
        },
        {
          id: 'TR001237',
          customerName: 'WXH888',
          customerId: 52,
          driverName: '王师傅',
          driverId: 157,
          route: '111 → 222',
          amount: 120,
          status: 'completed',
          fromLocation: '111',
          toLocation: '222'
        }
      ];
    } catch (error) {
      console.error('获取最近行程失败:', error);
      throw error;
    }
  },

  // 获取用户列表 - 使用已知用户
  async getUsers() {
    try {
      // 返回已知用户列表
      return [
        { id: 1, username: 'LiuJiahao', email: 'noctisren@qq.com', mobile: '13980029082' },
        { id: 3, username: 'LJHTEST', email: 'Nddd@qq.com', mobile: '13980029082' },
        { id: 30, username: 'HXW666', email: 'testemail@qq.com', mobile: '1234567890' },
        { id: 52, username: 'WXH888', email: 'testemail@qq.com', mobile: '1234567890' },
        { id: 61, username: 'TWQ666', email: '1123@qq.com', mobile: '13980029082' },
        { id: 133, username: '110112', email: 'test111@qq.com', mobile: '13980029082' }
      ];
    } catch (error) {
      console.error('获取用户列表失败:', error);
      throw error;
    }
  },

  // 获取司机列表 - 使用已知司机ID
  async getDrivers() {
    try {
      return [
        { id: 133, username: '110112', licenseNo: 'TEST12345678', rating: 4.8, available: true },
        { id: 146, username: '123123132', licenseNo: 'DRIV12345678', rating: 4.9, available: true },
        { id: 148, username: '2454712312313', licenseNo: 'CAR12345678', rating: 4.7, available: false },
        { id: 157, username: '123213123123', licenseNo: 'TAXI12345678', rating: 4.5, available: true }
      ];
    } catch (error) {
      console.error('获取司机列表失败:', error);
      throw error;
    }
  },

  // 获取行程列表
  async getTrips(params = {}) {
    try {
      const response = await api.get('/admin/trips', { params });
      return response.data;
    } catch (error) {
      console.error('获取行程列表失败:', error);
      throw error;
    }
  }
};