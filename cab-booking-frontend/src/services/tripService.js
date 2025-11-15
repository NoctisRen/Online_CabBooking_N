// src/services/tripService.js - 修复行程状态版本
import api from './api';

export const tripService = {
  // 预订行程 - 修复字段名大小写问题
  async bookTrip(tripData) {
    try {
      console.log('原始行程数据:', tripData);
      
      // 根据后端TripBooking实体调整数据格式 - 使用正确的字段名
      const formattedData = {
        customerId: tripData.customerId, // 保持小写
        from_location: tripData.fromLocation, // 改为小写
        to_location: tripData.toLocation, // 改为小写
        fromdate_time: tripData.fromDateTime, // 改为小写
        todate_time: tripData.toDateTime, // 改为小写
        km: tripData.km,
        payment: tripData.payment || false // 确保新行程payment为false
      };
      
      console.log('格式化后的行程数据:', formattedData);
      
      const response = await api.post('/trip', formattedData);
      console.log('行程预订成功响应:', response.data);
      return response.data;
    } catch (error) {
      console.error('预订行程失败:', error);
      console.error('错误详情:', error.response?.data);
      throw this.handleTripError(error);
    }
  },

  // 取消行程
  async cancelTrip(tripId) {
    try {
      const response = await api.delete(`/tripdelete/${tripId}`);
      return response.data;
    } catch (error) {
      console.error('取消行程失败:', error);
      throw this.handleTripError(error);
    }
  },

  // 获取所有行程 - 修复字段映射和状态处理
  async getAllTrips() {
    try {
      const response = await api.get('/trips');
      const trips = response.data;
      console.log('原始行程数据:', trips);
      
      // 统一字段名处理
      const normalizedTrips = trips.map(trip => {
        // 处理不同的字段命名方式
        const normalizedTrip = {
          // 统一字段名
          tripBookingId: trip.tripBookingId || trip.TripBookingId,
          customerId: trip.customerId || trip.CustomerId,
          fromLocation: trip.fromLocation || trip.From_location || trip.from_location,
          toLocation: trip.toLocation || trip.To_location || trip.to_location,
          fromDateTime: trip.fromDateTime || trip.Fromdate_time || trip.fromdate_time,
          toDateTime: trip.toDateTime || trip.Todate_time || trip.todate_time,
          km: trip.km,
          totalAmount: trip.totalAmount || trip.Totalamount,
          // 修复支付状态：确保正确处理布尔值
          payment: this.normalizePaymentStatus(trip.Payment || trip.payment),
          // 处理driver字段
          driver: trip.driver ? {
            userId: trip.driver.userId || trip.driver.driverId,
            username: trip.driver.username || trip.driver.Username,
            rating: trip.driver.rating,
            available: trip.driver.available,
            licenseNo: trip.driver.licenseNo,
            cab: trip.driver.cab ? {
              cabId: trip.driver.cab.cabId,
              carType: trip.driver.cab.carType,
              ratePerKm: trip.driver.cab.ratePerKm
            } : null
          } : null
        };
        
        console.log('标准化后的行程:', normalizedTrip);
        return normalizedTrip;
      });
      
      return normalizedTrips;
    } catch (error) {
      console.error('获取行程失败:', error);
      // 返回空数组而不是抛出错误，避免页面崩溃
      return [];
    }
  },

  // 标准化支付状态
  normalizePaymentStatus(payment) {
    if (payment === null || payment === undefined) {
      return false;
    }
    if (typeof payment === 'boolean') {
      return payment;
    }
    if (typeof payment === 'string') {
      return payment.toLowerCase() === 'true';
    }
    if (typeof payment === 'number') {
      return payment === 1;
    }
    return Boolean(payment);
  },

  // 结束行程
  async endTrip(tripId) {
    try {
      console.log('结束行程请求，行程ID:', tripId);
      const response = await api.patch(`/tripend/${tripId}`);
      console.log('结束行程响应:', response.data);
      return response.data;
    } catch (error) {
      console.error('结束行程失败:', error);
      console.error('错误详情:', error.response?.data);
      throw this.handleTripError(error);
    }
  },

  // 获取司机行程 - 修复司机行程过滤
  async getDriverTrips(driverId) {
    try {
      const allTrips = await this.getAllTrips();
      console.log('所有行程数量:', allTrips.length);
      console.log('筛选司机ID:', driverId);
      
      const driverTrips = allTrips.filter(trip => {
        if (!trip.driver) {
          console.log('行程无司机信息:', trip.tripBookingId);
          return false;
        }
        
        const tripDriverId = trip.driver.userId;
        console.log(`行程 ${trip.tripBookingId} 的司机ID:`, tripDriverId, '目标司机ID:', driverId);
        
        return tripDriverId === driverId;
      });
      
      console.log('司机行程数量:', driverTrips.length);
      return driverTrips;
    } catch (error) {
      console.error('获取司机行程失败:', error);
      return [];
    }
  },

  // 获取乘客行程
  async getCustomerTrips(customerId) {
    try {
      const allTrips = await this.getAllTrips();
      return allTrips.filter(trip => trip.customerId === customerId);
    } catch (error) {
      console.error('获取乘客行程失败:', error);
      return [];
    }
  },

  // 更新行程
  async updateTrip(tripId, tripData) {
    try {
      const formattedData = {
        customerId: tripData.customerId,
        from_location: tripData.fromLocation,
        to_location: tripData.toLocation,
        fromdate_time: tripData.fromDateTime,
        todate_time: tripData.toDateTime,
        km: tripData.km,
        payment: tripData.payment
      };
      
      const response = await api.put(`/tripupdate/${tripId}`, formattedData);
      return response.data;
    } catch (error) {
      console.error('更新行程失败:', error);
      throw this.handleTripError(error);
    }
  },

  // 错误处理
  handleTripError(error) {
    if (error.response?.data) {
      const { message, fieldErrors, error: errorMsg } = error.response.data;
      
      // 处理字段级错误 - 修复错误消息解析
      if (fieldErrors) {
        console.log('字段错误详情:', fieldErrors);
        
        // 提取具体的错误消息
        const errorMessages = Object.entries(fieldErrors).map(([field, errorKey]) => {
          // 根据错误键返回用户友好的消息
          const errorMap = {
            'data not null': '不能为空',
            'To Loccation notNull': '目的地不能为空', 
            'From Location notNull': '出发地不能为空',
            'futOrPres': '必须是当前或将来的时间'
          };
          
          const fieldMap = {
            'customerId': '客户ID',
            'from_location': '出发地',
            'to_location': '目的地', 
            'fromdate_time': '出发时间',
            'todate_time': '到达时间',
            'km': '距离',
            'payment': '支付状态'
          };
          
          const fieldName = fieldMap[field] || field;
          const errorText = errorMap[errorKey] || errorKey;
          
          return `${fieldName}${errorText}`;
        }).join('，');
        
        return new Error(`请检查以下信息：${errorMessages}`);
      }
      
      // 处理全局错误消息
      if (message) {
        return new Error(message);
      }
      
      if (errorMsg) {
        return new Error(errorMsg);
      }
      
      // 处理其他错误响应格式
      if (typeof error.response.data === 'string') {
        return new Error(error.response.data);
      }
    }
    
    // 网络错误或其他未知错误
    if (error.message.includes('Network Error')) {
      return new Error('网络连接失败，请检查网络设置');
    }
    
    return new Error('操作失败，请稍后重试');
  }
};