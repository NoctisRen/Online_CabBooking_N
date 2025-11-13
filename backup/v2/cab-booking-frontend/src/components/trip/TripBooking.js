// src/components/trip/TripBooking.js - 添加司机可用性检查
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tripService } from '../../services/tripService';
import { validateTripForm } from '../../utils/validation';

const TripBooking = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    customerId: currentUser?.userId || '',
    fromLocation: '',
    toLocation: '',
    fromDateTime: '',
    toDateTime: '',
    km: '',
    payment: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdTrip, setCreatedTrip] = useState(null);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [driverAvailable, setDriverAvailable] = useState(true); // 添加司机可用性状态

  const ratePerKm = 8;

  useEffect(() => {
    if (formData.km && !isNaN(formData.km)) {
      const price = parseInt(formData.km) * ratePerKm;
      setEstimatedPrice(price);
    } else {
      setEstimatedPrice(0);
    }
  }, [formData.km]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateTripForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const tripData = {
        customerId: parseInt(formData.customerId),
        from_location: formData.fromLocation,
        to_location: formData.toLocation,
        fromdate_time: formData.fromDateTime + 'T00:00:00',
        todate_time: formData.toDateTime + 'T00:00:00',
        km: parseInt(formData.km),
        payment: formData.payment
      };

      console.log('修复字段名后的行程预订请求:', tripData);
      const result = await tripService.createTrip(tripData);
      console.log('行程创建成功:', result);
      
      setCreatedTrip(result);
      setSuccess(true);
      setDriverAvailable(true);
      
      // 重置表单
      setFormData({
        customerId: currentUser?.userId || '',
        fromLocation: '',
        toLocation: '',
        fromDateTime: '',
        toDateTime: '',
        km: '',
        payment: false
      });
      
    } catch (error) {
      console.error('行程创建错误详情:', error);
      
      let errorMessage = error.message;
      
      // 处理司机不可用的情况
      if (error.message.includes('No driver Available') || 
          error.message.includes('Sorry No driver Available')) {
        errorMessage = '目前没有可用的司机，请稍后再试或联系客服';
        setDriverAvailable(false);
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleNewBooking = () => {
    setSuccess(false);
    setCreatedTrip(null);
    setDriverAvailable(true);
  };

  const handleRetryBooking = () => {
    setDriverAvailable(true);
    setErrors({});
  };

  // 司机不可用时的提示页面
  if (!driverAvailable && !success) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">暂时无法预订</h2>
          <p className="mt-2 text-gray-600">当前没有可用的司机接单</p>
        </div>

        <div className="mt-6 bg-yellow-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-4">建议操作</h3>
          <ul className="space-y-2 text-sm text-yellow-700">
            <li>• 请稍等几分钟后重试</li>
            <li>• 尝试调整您的出行时间</li>
            <li>• 联系客服获取更多帮助</li>
            <li>• 司机通常在早晚高峰时段较为繁忙</li>
          </ul>
        </div>

        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleRetryBooking}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            重新尝试预订
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  // 成功页面保持不变...
  if (success && createdTrip) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">行程预订成功！</h2>
          <p className="mt-2 text-gray-600">司机已分配，请等待司机接单</p>
        </div>

        <div className="mt-6 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">行程详情</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">行程ID:</span>
              <span className="ml-2 text-gray-900">{createdTrip.tripBookingId || createdTrip.TripBookingId}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">客户ID:</span>
              <span className="ml-2 text-gray-900">{createdTrip.customerId}</span>
            </div>
            <div className="col-span-2">
              <span className="font-medium text-gray-700">路线:</span>
              <span className="ml-2 text-gray-900">
                {createdTrip.from_location || createdTrip.fromLocation} → {createdTrip.to_location || createdTrip.toLocation}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">出发时间:</span>
              <span className="ml-2 text-gray-900">
                {new Date(createdTrip.fromdate_time || createdTrip.fromDateTime).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">到达时间:</span>
              <span className="ml-2 text-gray-900">
                {new Date(createdTrip.todate_time || createdTrip.toDateTime).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">距离:</span>
              <span className="ml-2 text-gray-900">{createdTrip.km} 公里</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">总金额:</span>
              <span className="ml-2 text-green-600 font-bold">¥{createdTrip.totalAmount || createdTrip.Totalamount}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleNewBooking}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            预订新行程
          </button>
          <button
            onClick={() => window.location.href = '/my-trips'}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
          >
            查看我的行程
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">行程预订</h1>
        <p className="mt-2 text-gray-600">填写行程信息，系统将自动为您分配司机</p>
        
        {/* 添加司机状态提示 */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-center">
            <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-blue-700">
              系统将自动为您分配可用司机
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 客户ID */}
        <div>
          <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
            客户ID
          </label>
          <input
            id="customerId"
            name="customerId"
            type="text"
            value={formData.customerId}
            readOnly
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 出发地 */}
          <div>
            <label htmlFor="fromLocation" className="block text-sm font-medium text-gray-700">
              出发地 *
            </label>
            <input
              id="fromLocation"
              name="fromLocation"
              type="text"
              value={formData.fromLocation}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.fromLocation ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              placeholder="请输入出发地址"
              required
            />
          </div>

          {/* 目的地 */}
          <div>
            <label htmlFor="toLocation" className="block text-sm font-medium text-gray-700">
              目的地 *
            </label>
            <input
              id="toLocation"
              name="toLocation"
              type="text"
              value={formData.toLocation}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.toLocation ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              placeholder="请输入目的地址"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 出发日期 */}
          <div>
            <label htmlFor="fromDateTime" className="block text-sm font-medium text-gray-700">
              出发日期 *
            </label>
            <input
              id="fromDateTime"
              name="fromDateTime"
              type="date"
              value={formData.fromDateTime}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.fromDateTime ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* 到达日期 */}
          <div>
            <label htmlFor="toDateTime" className="block text-sm font-medium text-gray-700">
              到达日期 *
            </label>
            <input
              id="toDateTime"
              name="toDateTime"
              type="date"
              value={formData.toDateTime}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.toDateTime ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              min={formData.fromDateTime || new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>

        {/* 距离和价格估算 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="km" className="block text-sm font-medium text-gray-700">
              预估距离 (公里) *
            </label>
            <input
              id="km"
              name="km"
              type="number"
              min="1"
              max="1000"
              value={formData.km}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.km ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              placeholder="例如：50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              估算价格
            </label>
            <div className="mt-1 p-2 bg-green-50 border border-green-200 rounded-md">
              <div className="text-lg font-bold text-green-700 text-center">
                ¥{estimatedPrice}
              </div>
              <div className="text-xs text-green-600 text-center">
                (距离 {formData.km || 0}km × 费率 ¥{ratePerKm}/km)
              </div>
            </div>
          </div>
        </div>

        {/* 支付选项 */}
        <div className="flex items-center">
          <input
            id="payment"
            name="payment"
            type="checkbox"
            checked={formData.payment}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="payment" className="ml-2 block text-sm text-gray-900">
            立即支付（行程结束后自动扣款）
          </label>
        </div>

        {errors.submit && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  预订失败
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errors.submit}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在分配司机...
              </>
            ) : (
              '立即预订行程'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TripBooking;