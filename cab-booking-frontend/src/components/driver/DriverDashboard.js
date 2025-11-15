// src/components/driver/DriverDashboard.js - 完整优化版本
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { driverService } from '../../services/driverService';
import { tripService } from '../../services/tripService';
import './DriverDashboard.css';

// 日期格式化函数
const formatTripDate = (dateString) => {
  if (!dateString) return '未设置';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '日期格式错误';
  }
};

const formatDateOnly = (dateString) => {
  if (!dateString) return '未设置';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '日期格式错误';
  }
};

const DriverDashboard = () => {
  const { currentUser, userType } = useAuth();
  const [driverInfo, setDriverInfo] = useState(null);
  const [currentTrips, setCurrentTrips] = useState([]);
  const [tripHistory, setTripHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [endingTrip, setEndingTrip] = useState(null);
  const [showEarlyEndModal, setShowEarlyEndModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [earlyEndReason, setEarlyEndReason] = useState('');

  useEffect(() => {
    if (currentUser && userType === 'driver') {
      loadDriverData();
      
      const refreshInterval = setInterval(() => {
        if (activeTab === 'current') {
          refreshDriverData();
        }
      }, 5000);
      
      return () => clearInterval(refreshInterval);
    }
  }, [currentUser, userType, activeTab]);

  const loadDriverData = async () => {
    try {
      setLoading(true);
      const driverData = await driverService.getDriver(currentUser.userId);
      setDriverInfo(driverData);
      setEditForm({
        mobile: driverData.mobile,
        email: driverData.email,
        licenseNo: driverData.licenseNo,
        rating: driverData.rating,
        available: driverData.available
      });

      await loadTripData();
    } catch (error) {
      console.error('加载司机数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshDriverData = async () => {
    if (refreshing) return;
    
    try {
      setRefreshing(true);
      await loadTripData();
    } catch (error) {
      console.error('刷新司机数据失败:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadTripData = async () => {
    try {
      const driverTrips = await tripService.getDriverTrips(currentUser.userId);

      const activeTrips = driverTrips.filter(trip => {
        const isActive = !trip.payment;
        return isActive;
      });
      
      const completedTrips = driverTrips.filter(trip => {
        const isCompleted = trip.payment;
        return isCompleted;
      });
      
      setCurrentTrips(activeTrips);
      setTripHistory(completedTrips);
    } catch (error) {
      console.error('加载行程数据失败:', error);
      setCurrentTrips([]);
      setTripHistory([]);
    }
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    if (editing) {
      setEditForm({
        mobile: driverInfo.mobile,
        email: driverData.email,
        licenseNo: driverInfo.licenseNo,
        rating: driverInfo.rating,
        available: driverInfo.available
      });
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      const updatedDriver = await driverService.updateDriver(
        currentUser.userId,
        editForm.licenseNo,
        editForm.available
      );
      setDriverInfo(updatedDriver);
      setEditing(false);
      alert('信息更新成功！');
      await loadTripData();
    } catch (error) {
      console.error('更新失败:', error);
      alert('更新失败: ' + error.message);
    }
  };

	const handleTripAction = async (tripId, action) => {
	  try {
		if (action === 'end') {
		  const trip = currentTrips.find(t => t.tripBookingId === tripId);
		  setSelectedTrip(trip);
		  
		  // 检查是否提前结束
		  const now = new Date();
		  const toDateTime = new Date(trip.toDateTime);
		  
		  if (now < toDateTime) {
			// 提前结束，显示确认模态框
			setShowEarlyEndModal(true);
		  } else {
			// 正常结束
			if (!confirm('确定要结束这个行程吗？结束后将进行费用结算。')) {
			  return;
			}
			await endTrip(tripId, false);
		  }
		}
	  } catch (error) {
		console.error('操作失败:', error);
		alert('操作失败: ' + error.message);
	  }
	};

	const endTrip = async (tripId, isEarlyEnd = false, earlyEndReason = '') => {
	  try {
		setEndingTrip(tripId);
		const result = await tripService.endTrip(tripId, isEarlyEnd, earlyEndReason);
		alert('行程已成功结束！费用已结算。');
		await loadDriverData();
		setActiveTab('history');
	  } catch (error) {
		throw error;
	  } finally {
		setEndingTrip(null);
	  }
	};

	const handleEarlyEndConfirm = async () => {
	  if (!earlyEndReason.trim()) {
		alert('请填写提前结束的原因');
		return;
	  }

	  try {
		await endTrip(selectedTrip.tripBookingId, true, earlyEndReason);
		setShowEarlyEndModal(false);
		setEarlyEndReason('');
		setSelectedTrip(null);
		
		console.log('提前结束行程原因:', earlyEndReason);
	  } catch (error) {
		console.error('提前结束行程失败:', error);
		alert('提前结束行程失败: ' + error.message);
	  }
	};

  const handleToggleAvailability = async () => {
    try {
      const newAvailability = !driverInfo.available;
      const updatedDriver = await driverService.updateDriver(
        currentUser.userId,
        driverInfo.licenseNo,
        newAvailability
      );
      setDriverInfo(updatedDriver);
      setEditForm(prev => ({ ...prev, available: newAvailability }));
      alert(`状态已切换为: ${newAvailability ? '可接单' : '忙碌中'}`);
      await loadTripData();
    } catch (error) {
      console.error('切换状态失败:', error);
      alert('切换状态失败: ' + error.message);
    }
  };

  // 计算收入统计
  const calculateEarnings = () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todayEarnings = tripHistory
      .filter(trip => {
        const tripDate = new Date(trip.fromDateTime);
        return tripDate >= todayStart;
      })
      .reduce((sum, trip) => sum + (trip.totalAmount || 0), 0);

    const monthEarnings = tripHistory
      .filter(trip => {
        const tripDate = new Date(trip.fromDateTime);
        return tripDate.getMonth() === today.getMonth() && 
               tripDate.getFullYear() === today.getFullYear();
      })
      .reduce((sum, trip) => sum + (trip.totalAmount || 0), 0);

    const totalEarnings = tripHistory.reduce((sum, trip) => sum + (trip.totalAmount || 0), 0);

    return {
      today: todayEarnings,
      month: monthEarnings,
      total: totalEarnings
    };
  };

  const earnings = calculateEarnings();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="text-gray-600 mt-4">加载司机信息中...</p>
      </div>
    );
  }

  if (!driverInfo) {
    return (
      <div className="loading-container">
        <p className="text-gray-600">无法加载司机信息</p>
        <button
          onClick={loadDriverData}
          className="btn btn-primary mt-4"
        >
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div className="driver-dashboard">
      {/* 顶部信息栏 */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="header-title">
            <h1>司机工作台</h1>
            <p>欢迎回来，{driverInfo.username}</p>
          </div>
          <div className="header-status">
            <div className={`status-badge ${driverInfo.available ? 'status-available' : 'status-busy'}`}>
              {driverInfo.available ? '可接单' : '忙碌中'}
            </div>
            <button
              onClick={handleToggleAvailability}
              className="status-toggle"
            >
              {driverInfo.available ? '设为忙碌' : '设为可接单'}
            </button>
            <p className="text-sm mt-1">评分: {driverInfo.rating} ⭐ | ID: {driverInfo.userId}</p>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="dashboard-tabs">
        <div className="tabs-container">
          <nav className="tabs-nav">
            {[
              { id: 'current', name: `当前行程 ${currentTrips.length > 0 ? `(${currentTrips.length})` : ''}` },
              { id: 'history', name: '历史行程' },
              { id: 'profile', name: '个人信息' },
              { id: 'earnings', name: '收入统计' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.name}
                {tab.id === 'current' && refreshing && (
                  <span className="ml-2">⟳</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="dashboard-content">
        <div className="content-area">
          
          {/* 当前行程标签页 */}
          {activeTab === 'current' && (
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-header-inner">
                  <h3 className="card-title">
                    当前行程
                    {currentTrips.length > 0 && (
                      <span className="text-sm text-gray-500 ml-2">({currentTrips.length}个待完成)</span>
                    )}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={refreshDriverData}
                      disabled={refreshing}
                      className="btn btn-secondary btn-sm"
                    >
                      {refreshing ? '刷新中...' : '刷新'}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="card-body">
                {currentTrips.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🚗</div>
                    <p className="empty-text">暂无进行中的行程</p>
                    <p className="text-sm text-gray-500">
                      {driverInfo.available 
                        ? '系统会自动为您分配新订单，请保持在线状态' 
                        : '您当前状态为忙碌中，系统不会分配新订单'}
                    </p>
                    {!driverInfo.available && (
                      <div className="space-y-2 mt-4">
                        <button
                          onClick={handleToggleAvailability}
                          className="btn btn-success"
                        >
                          切换为可接单
                        </button>
                        <p className="text-xs text-gray-500">切换为可接单状态后，系统会为您分配订单</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentTrips.map(trip => {
                      const now = new Date();
                      const toDateTime = new Date(trip.toDateTime);
                      const isEarlyEnd = now < toDateTime;
                      
                      return (
                        <div key={trip.tripBookingId} className="trip-card active">
                          <div className="trip-header">
                            <div className="trip-info">
                              <div className="trip-id">
                                <span className="text-sm text-gray-500">行程ID:</span>
                                <span className="font-medium bg-white px-2 py-1 rounded">
                                  {trip.tripBookingId}
                                </span>
                                <span className="trip-badge badge-warning">
                                  进行中
                                </span>
                                {isEarlyEnd && (
                                  <span className="trip-badge badge-info">
                                    可提前结束
                                  </span>
                                )}
                              </div>
                              
                              <div className="trip-route">
                                <div className="route-from">
                                  <span className="location-label">出发地:</span>
                                  <p className="location-value">{trip.fromLocation}</p>
                                </div>
                                <div className="route-arrow">→</div>
                                <div className="route-to">
                                  <span className="location-label">目的地:</span>
                                  <p className="location-value">{trip.toLocation}</p>
                                </div>
                              </div>
                              
                              <div className="driver-info">
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="stat-label">乘客ID:</span>
                                    <p className="stat-value">{trip.customerId}</p>
                                  </div>
                                  <div>
                                    <span className="stat-label">距离:</span>
                                    <p className="stat-value">{trip.km} 公里</p>
                                  </div>
                                  <div>
                                    <span className="stat-label">预估收入:</span>
                                    <p className="stat-value income">{trip.totalAmount} 元</p>
                                  </div>
                                  <div>
                                    <span className="stat-label">出发时间:</span>
                                    <p className="stat-value">{formatTripDate(trip.fromDateTime)}</p>
                                  </div>
                                </div>
                                {isEarlyEnd && (
                                  <div className="mt-2 p-2 bg-yellow-50 rounded">
                                    <p className="text-xs text-yellow-600">
                                      💡 预计结束时间: {formatTripDate(trip.toDateTime)}，您可以提前结束行程
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-sm text-gray-600 bg-white p-2 rounded">
                                <div className="flex items-center gap-2">
                                  <span>💡</span>
                                  <span>请按时到达出发地接载乘客，完成服务后点击"结束行程"</span>
                                </div>
                              </div>
                              
                              <div className="text-xs text-gray-500 mt-2">
                                支付状态: {trip.payment ? '已支付' : '未支付'} | 
                                行程状态: {trip.payment ? '已完成' : '进行中'}
                              </div>
                            </div>
                            
                            <div className="trip-actions">
                              <button
                                onClick={() => handleTripAction(trip.tripBookingId, 'end')}
                                disabled={endingTrip === trip.tripBookingId}
                                className="btn btn-success"
                              >
                                {endingTrip === trip.tripBookingId ? (
                                  <>
                                    <span className="loading-spinner loading-spinner-sm mr-2"></span>
                                    结束中...
                                  </>
                                ) : (
                                  <>
                                    <span className="mr-1">✓</span>
                                    结束行程
                                  </>
                                )}
                              </button>
                              <div className="action-note">
                                {isEarlyEnd ? '可提前结束' : '完成服务后结算'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 历史行程标签页 */}
          {activeTab === 'history' && (
            <div className="dashboard-card">
              <div className="card-header">
                <h3 className="card-title">历史行程</h3>
              </div>
              <div className="card-body">
                {tripHistory.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <p className="empty-text">暂无历史行程记录</p>
                    <p className="text-sm text-gray-500">完成行程后会自动显示在这里</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tripHistory.map(trip => (
                      <div key={trip.tripBookingId} className="trip-card completed">
                        <div className="grid grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="stat-label">行程ID:</span>
                            <p className="stat-value">{trip.tripBookingId}</p>
                          </div>
                          <div>
                            <span className="stat-label">路线:</span>
                            <p className="stat-value">{trip.fromLocation} → {trip.toLocation}</p>
                          </div>
                          <div>
                            <span className="stat-label">距离:</span>
                            <p className="stat-value">{trip.km}公里</p>
                          </div>
                          <div>
                            <span className="stat-label">收入:</span>
                            <p className="stat-value income">{trip.totalAmount}元</p>
                          </div>
                          <div>
                            <span className="stat-label">状态:</span>
                            <p className="stat-value text-green-600">已完成</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          乘客ID: {trip.customerId} | 完成时间: {formatTripDate(trip.toDateTime)} | 
                          支付状态: {trip.payment ? '已支付' : '未支付'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 个人信息标签页 */}
          {activeTab === 'profile' && (
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-header-inner">
                  <h3 className="card-title">个人信息</h3>
                  <button
                    onClick={handleEditToggle}
                    className={`btn ${editing ? 'btn-secondary' : 'btn-primary'}`}
                  >
                    {editing ? '取消编辑' : '编辑信息'}
                  </button>
                </div>
              </div>
              
              <div className="card-body">
                <div className="profile-section">
                  <h4 className="section-title">基本信息</h4>
                  <div className="profile-info">
                    <div className="info-item">
                      <span className="info-label">用户名</span>
                      <input
                        type="text"
                        value={driverInfo.username}
                        disabled
                        className="form-input"
                      />
                    </div>

                    <div className="info-item">
                      <span className="info-label">手机号</span>
                      {editing ? (
                        <input
                          type="tel"
                          name="mobile"
                          value={editForm.mobile}
                          onChange={handleEditChange}
                          className="form-input"
                        />
                      ) : (
                        <span className="info-value">{driverInfo.mobile}</span>
                      )}
                    </div>

                    <div className="info-item">
                      <span className="info-label">邮箱</span>
                      {editing ? (
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleEditChange}
                          className="form-input"
                        />
                      ) : (
                        <span className="info-value">{driverInfo.email}</span>
                      )}
                    </div>

                    <div className="info-item">
                      <span className="info-label">旅程状态</span>
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${
                          currentTrips.length > 0 ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <span className="info-value">
                          {currentTrips.length > 0 ? '旅程进行中' : '空闲'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h4 className="section-title">专业信息</h4>
                  <div className="profile-info">
                    <div className="info-item">
                      <span className="info-label">驾照号码</span>
                      {editing ? (
                        <input
                          type="text"
                          name="licenseNo"
                          value={editForm.licenseNo}
                          onChange={handleEditChange}
                          className="form-input"
                        />
                      ) : (
                        <span className="info-value">{driverInfo.licenseNo}</span>
                      )}
                    </div>

                    <div className="info-item">
                      <span className="info-label">评分</span>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500 text-lg">⭐</span>
                        <span className="info-value">{driverInfo.rating}</span>
                      </div>
                    </div>

                    <div className="info-item">
                      <span className="info-label">接单状态</span>
                      {editing ? (
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="available"
                            checked={editForm.available}
                            onChange={handleEditChange}
                            className="form-checkbox"
                          />
                          <span className="info-value ml-2">
                            {editForm.available ? '可接单' : '忙碌中'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className={`h-3 w-3 rounded-full mr-2 ${
                            driverInfo.available ? 'bg-green-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="info-value">
                            {driverInfo.available ? '可接单' : '忙碌中'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 车辆信息 */}
                  {driverInfo.cab && (
                    <div className="vehicle-info">
                      <h5 className="section-title">车辆信息</h5>
                      <div className="vehicle-grid">
                        <div className="info-item">
                          <span className="info-label">车型</span>
                          <span className="info-value">{driverInfo.cab.carType}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">费率</span>
                          <span className="info-value">{driverInfo.cab.ratePerKm} 元/公里</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">车辆ID</span>
                          <span className="info-value">{driverInfo.cab.cabId}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {editing && (
                  <div className="form-actions">
                    <button
                      onClick={handleSave}
                      className="btn btn-success"
                    >
                      保存更改
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 收入统计标签页 */}
          {activeTab === 'earnings' && (
            <div className="dashboard-card">
              <div className="card-header">
                <h3 className="card-title">收入统计</h3>
              </div>
              
              <div className="card-body">
                <div className="earnings-grid">
                  <div className="earnings-card earnings-today">
                    <div className="earnings-label">今日收入</div>
                    <div className="earnings-value">{earnings.today} 元</div>
                  </div>
                  
                  <div className="earnings-card earnings-month">
                    <div className="earnings-label">本月收入</div>
                    <div className="earnings-value">{earnings.month} 元</div>
                  </div>
                  
                  <div className="earnings-card earnings-total">
                    <div className="earnings-label">总收入</div>
                    <div className="earnings-value">{earnings.total} 元</div>
                  </div>
                </div>

                <div className="earnings-chart">
                  <h4 className="chart-title">收入趋势</h4>
                  <div className="chart-placeholder">
                    <span>收入图表展示区域</span>
                  </div>
                </div>

                {tripHistory.length > 0 && (
                  <div className="earnings-list">
                    <h4 className="chart-title">最近收入记录</h4>
                    <div className="space-y-2">
                      {tripHistory.slice(0, 10).map(trip => (
                        <div key={trip.tripBookingId} className="earnings-item">
                          <div className="earnings-route">
                            <div className="font-medium">{trip.fromLocation} → {trip.toLocation}</div>
                            <div className="text-sm text-gray-500">
                              距离: {trip.km}公里 | 时间: {formatDateOnly(trip.fromDateTime)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="earnings-amount">{trip.totalAmount}元</div>
                            <div className="earnings-date">{formatDateOnly(trip.toDateTime)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 提前结束行程模态框 */}
      {showEarlyEndModal && selectedTrip && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">提前结束行程</h3>
              <p className="modal-description">
                您正在提前结束行程 ID: {selectedTrip.tripBookingId}。请说明提前结束的原因。
              </p>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">提前结束原因</label>
                <textarea
                  value={earlyEndReason}
                  onChange={(e) => setEarlyEndReason(e.target.value)}
                  className="form-input"
                  rows="4"
                  placeholder="请简要说明提前结束行程的原因（例如：乘客要求、交通状况、车辆问题等）"
                />
              </div>
              
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700">
                  💡 提示：提前结束行程可能会影响您的服务评分，请确保有合理的理由。
                </p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowEarlyEndModal(false);
                  setEarlyEndReason('');
                  setSelectedTrip(null);
                }}
                className="btn btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleEarlyEndConfirm}
                className="btn btn-warning"
              >
                确认提前结束
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;