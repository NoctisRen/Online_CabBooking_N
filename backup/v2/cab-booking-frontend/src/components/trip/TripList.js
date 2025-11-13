// src/components/trip/TripList.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tripService } from '../../services/tripService';

const TripList = () => {
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      // 这里需要根据实际API调整获取用户行程的方式
      const allTrips = await tripService.getAllTrips();
      // 过滤出当前用户的行程
      const userTrips = allTrips.filter(trip => 
        trip.customerId === currentUser?.userId || 
        trip.CustomerId === currentUser?.userId
      );
      setTrips(userTrips);
    } catch (err) {
      setError('加载行程失败: ' + err.message);
      console.error('加载行程错误:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEndTrip = async (tripId) => {
    if (!window.confirm('确定要结束这个行程吗？')) return;
    
    try {
      await tripService.endTrip(tripId);
      alert('行程已结束');
      loadTrips(); // 重新加载列表
    } catch (err) {
      alert('结束行程失败: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getStatusBadge = (trip) => {
    if (trip.Payment) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">已完成</span>;
    }
    return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">进行中</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-700">{error}</div>
        <button
          onClick={loadTrips}
          className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">我的行程</h1>
        <button
          onClick={() => window.location.href = '/book-trip'}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          新建行程
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🚗</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无行程记录</h3>
          <p className="text-gray-600 mb-4">开始您的第一次网约车之旅吧！</p>
          <button
            onClick={() => window.location.href = '/book-trip'}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md text-sm font-medium"
          >
            立即预订行程
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {trips.map((trip) => (
              <li key={trip.tripBookingId || trip.TripBookingId}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        行程 #{trip.tripBookingId || trip.TripBookingId}
                      </p>
                      <div className="ml-2">
                        {getStatusBadge(trip)}
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="text-sm font-bold text-gray-900">
                        ¥{trip.Totalamount || trip.totalAmount}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        🚩 {trip.From_location || trip.fromLocation}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        🎯 {trip.To_location || trip.toLocation}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        {formatDate(trip.Fromdate_time || trip.fromDateTime)} -{' '}
                        {formatDate(trip.Todate_time || trip.toDateTime)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      距离: {trip.km}km | 
                      {trip.driver && ` 司机: ${trip.driver.username} (${trip.driver.rating}⭐)`}
                    </div>
                    {!trip.Payment && (
                      <button
                        onClick={() => handleEndTrip(trip.tripBookingId || trip.TripBookingId)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        结束行程
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TripList;