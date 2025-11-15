// src/components/customer/CustomerDashboard.js - 修复版本
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customerService';
import { tripService } from '../../services/tripService';
import { driverService } from '../../services/driverService';
import { validateTripForm } from '../../utils/validation';
import './CustomerDashboard.css'; // 导入CSS文件

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

// 格式化仅日期
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

const CustomerDashboard = () => {
  const { currentUser } = useAuth();
  const [customerInfo, setCustomerInfo] = useState(null);
  const [activeTrips, setActiveTrips] = useState([]);
  const [tripHistory, setTripHistory] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('book');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [bookingErrors, setBookingErrors] = useState({});
  const [bookingLoading, setBookingLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // 行程预订表单状态
  const [bookingForm, setBookingForm] = useState({
    fromLocation: '',
    toLocation: '',
    fromDateTime: new Date().toISOString().split('T')[0],
    toDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    km: ''
  });

  useEffect(() => {
    if (currentUser) {
      loadCustomerData();
      loadAvailableDrivers();
      
      // 设置自动刷新当前行程
      const refreshInterval = setInterval(() => {
        if (activeTab === 'active' && activeTrips.length > 0) {
          refreshActiveTrips();
        }
      }, 5000);
      
      return () => clearInterval(refreshInterval);
    }
  }, [currentUser, activeTab, activeTrips.length]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const customerData = await customerService.getCustomer(currentUser.userId);
      setCustomerInfo(customerData);
      setEditForm({
        mobile: customerData.mobile,
        email: customerData.email,
        address: customerData.address || { city: '', state: '', pincode: '' }
      });

      await loadTripData();
    } catch (error) {
      console.error('加载乘客数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTripData = async () => {
    try {
      console.log('开始加载行程数据...');
      const customerTrips = await tripService.getCustomerTrips(currentUser.userId);
      console.log('客户所有行程:', customerTrips);

      // 使用统一的payment字段
      const active = customerTrips.filter(trip => {
        const isActive = !trip.payment;
        return isActive;
      });
      
      const history = customerTrips.filter(trip => {
        const isHistory = trip.payment;
        return isHistory;
      });
      
      setActiveTrips(active);
      setTripHistory(history);
    } catch (error) {
      console.error('加载行程数据失败:', error);
      setActiveTrips([]);
      setTripHistory([]);
    }
  };

  const refreshActiveTrips = async () => {
    if (refreshing) return;
    
    try {
      setRefreshing(true);
      await loadTripData();
    } catch (error) {
      console.error('刷新行程数据失败:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadAvailableDrivers = async () => {
    try {
      console.log('开始加载司机信息...');
      const drivers = await driverService.getBestDrivers();
      console.log('获取到的司机数据:', drivers);
      
      if (Array.isArray(drivers)) {
        setAvailableDrivers(drivers);
      } else {
        console.warn('司机数据不是数组:', drivers);
        setAvailableDrivers([]);
      }
    } catch (error) {
      console.error('加载司机信息失败:', error);
      setAvailableDrivers([]);
    }
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    if (editing) {
      setEditForm({
        mobile: customerInfo.mobile,
        email: customerInfo.email,
        address: customerInfo.address || { city: '', state: '', pincode: '' }
      });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setEditForm(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedCustomer = await customerService.updateCustomer(
        currentUser.userId,
        editForm
      );
      setCustomerInfo(updatedCustomer);
      setEditing(false);
      alert('信息更新成功！');
    } catch (error) {
      console.error('更新失败:', error);
      alert('更新失败: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBookingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (bookingErrors[name]) {
      setBookingErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBookTrip = async (e) => {
    e.preventDefault();
    
    const errors = validateTripForm(bookingForm);
    setBookingErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      alert('请修正表单中的错误');
      return;
    }

    setBookingLoading(true);

    try {
      const tripData = {
        customerId: currentUser.userId,
        fromLocation: bookingForm.fromLocation.trim(),
        toLocation: bookingForm.toLocation.trim(),
        fromDateTime: bookingForm.fromDateTime,
        toDateTime: bookingForm.toDateTime,
        km: parseInt(bookingForm.km),
        payment: false
      };

      console.log('发送行程预订请求:', tripData);
      const newTrip = await tripService.bookTrip(tripData);
      console.log('行程预订成功响应:', newTrip);
      
      alert('行程预订成功！司机已分配，请查看当前行程。');
      
      setBookingForm({
        fromLocation: '',
        toLocation: '',
        fromDateTime: new Date().toISOString().split('T')[0],
        toDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        km: ''
      });
      setBookingErrors({});
      
      await loadCustomerData();
      setActiveTab('active');
      
    } catch (error) {
      console.error('预订失败:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('DriverNotFoundException')) {
        errorMessage = '抱歉，当前没有可用司机，请稍后重试';
      } else if (error.message.includes('InvalidId')) {
        errorMessage = '客户信息无效，请重新登录';
      } else if (error.message.includes('网络连接失败')) {
        errorMessage = '网络连接失败，请检查网络设置';
      } else if (error.message.includes('Customer with ID')) {
        errorMessage = '客户信息不存在，请重新登录';
      }
      
      alert('预订失败: ' + errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelTrip = async (tripId) => {
    if (!confirm('确定要取消这个行程吗？取消后可能需要支付取消费用。')) {
      return;
    }

    try {
      await tripService.cancelTrip(tripId);
      alert('行程已取消');
      await loadCustomerData();
    } catch (error) {
      console.error('取消行程失败:', error);
      alert('取消失败: ' + error.message);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await loadCustomerData();
    await loadAvailableDrivers();
    setLoading(false);
    alert('数据已刷新！');
  };

  const handleRefreshDrivers = async () => {
    await loadAvailableDrivers();
    alert('司机列表已刷新！');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>加载乘客信息中...</p>
      </div>
    );
  }

  if (!customerInfo) {
    return (
      <div className="dashboard-error">
        <p>无法加载乘客信息</p>
        <button onClick={handleRefresh} className="btn btn-primary">
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      {/* 顶部信息栏 */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h1>乘客中心</h1>
            <p>欢迎回来，{customerInfo.username}</p>
          </div>
          <div className="header-status">
            <div className={`status-badge ${activeTrips.length > 0 ? 'active' : 'idle'}`}>
              旅程状态: {activeTrips.length > 0 ? '进行中' : '空闲'}
            </div>
            <p>ID: {customerInfo.userId}</p>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="dashboard-tabs">
        <nav className="tab-navigation">
          {[
            { id: 'book', name: '预订行程' },
            { id: 'active', name: `当前行程 ${activeTrips.length > 0 ? `(${activeTrips.length})` : ''}` },
            { id: 'history', name: `历史行程 ${tripHistory.length > 0 ? `(${tripHistory.length})` : ''}` },
            { id: 'profile', name: '个人信息' },
            { id: 'drivers', name: `附近司机 ${availableDrivers.length > 0 ? `(${availableDrivers.length})` : ''}` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.name}
              {tab.id === 'active' && refreshing && (
                <span className="refresh-indicator">⟳</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* 内容区域 */}
      <div className="dashboard-content">
        
        {/* 预订行程标签页 */}
        {activeTab === 'book' && (
          <div className="content-card">
            <div className="card-header">
              <h3>预订新行程</h3>
              <p>新行程将自动分配给可用司机，行程结束后自动支付</p>
            </div>
            
            <div className="card-body">
              <form onSubmit={handleBookTrip} className="booking-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">出发地 *</label>
                    <input
                      type="text"
                      name="fromLocation"
                      value={bookingForm.fromLocation}
                      onChange={handleBookingChange}
                      className={`form-input ${bookingErrors.fromLocation ? 'error' : ''}`}
                      placeholder="请输入出发地址"
                    />
                    {bookingErrors.fromLocation && (
                      <p className="error-message">{bookingErrors.fromLocation}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">目的地 *</label>
                    <input
                      type="text"
                      name="toLocation"
                      value={bookingForm.toLocation}
                      onChange={handleBookingChange}
                      className={`form-input ${bookingErrors.toLocation ? 'error' : ''}`}
                      placeholder="请输入目的地址"
                    />
                    {bookingErrors.toLocation && (
                      <p className="error-message">{bookingErrors.toLocation}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">出发时间 *</label>
                    <input
                      type="date"
                      name="fromDateTime"
                      value={bookingForm.fromDateTime}
                      onChange={handleBookingChange}
                      className={`form-input ${bookingErrors.fromDateTime ? 'error' : ''}`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {bookingErrors.fromDateTime && (
                      <p className="error-message">{bookingErrors.fromDateTime}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">到达时间 *</label>
                    <input
                      type="date"
                      name="toDateTime"
                      value={bookingForm.toDateTime}
                      onChange={handleBookingChange}
                      className={`form-input ${bookingErrors.toDateTime ? 'error' : ''}`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {bookingErrors.toDateTime && (
                      <p className="error-message">{bookingErrors.toDateTime}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">预估距离 (公里) *</label>
                    <input
                      type="number"
                      name="km"
                      value={bookingForm.km}
                      onChange={handleBookingChange}
                      className={`form-input ${bookingErrors.km ? 'error' : ''}`}
                      placeholder="请输入距离"
                      min="1"
                      max="1000"
                    />
                    {bookingErrors.km && (
                      <p className="error-message">{bookingErrors.km}</p>
                    )}
                  </div>
                </div>

                <div className="cost-estimation">
                  <h4>费用估算</h4>
                  <div className="estimation-content">
                    {bookingForm.km ? (
                      <>
                        <p>距离: {bookingForm.km} 公里 | 预估费用: {bookingForm.km * 2} 元</p>
                        <p className="estimation-note">* 费用估算仅供参考，实际费用以行程结束为准</p>
                        <p className="estimation-note success">* 行程结束后系统将自动扣款，无需提前支付</p>
                      </>
                    ) : (
                      '填写距离后显示费用估算'
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setBookingForm({
                      fromLocation: '',
                      toLocation: '',
                      fromDateTime: new Date().toISOString().split('T')[0],
                      toDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      km: ''
                    })}
                    className="btn btn-secondary"
                  >
                    重置
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="btn btn-primary"
                  >
                    {bookingLoading ? (
                      <>
                        <span className="loading-spinner-small"></span>
                        预订中...
                      </>
                    ) : (
                      '立即预订'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 当前行程标签页 */}
        {activeTab === 'active' && (
          <div className="content-card">
            <div className="card-header">
              <div className="card-header-row">
                <h3>
                  当前行程
                  {activeTrips.length > 0 && (
                    <span className="badge-count">({activeTrips.length}个进行中)</span>
                  )}
                </h3>
                <button
                  onClick={refreshActiveTrips}
                  disabled={refreshing}
                  className="btn btn-outline"
                >
                  {refreshing ? (
                    <>
                      <span className="loading-spinner-small"></span>
                      刷新中
                    </>
                  ) : (
                    '刷新'
                  )}
                </button>
              </div>
            </div>
            
            <div className="card-body">
              {activeTrips.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🚕</div>
                  <p>暂无进行中的行程</p>
                  <p className="empty-description">预订行程后，司机会接单并开始服务</p>
                  <button
                    onClick={() => setActiveTab('book')}
                    className="btn btn-primary"
                  >
                    立即预订
                  </button>
                </div>
              ) : (
                <div className="trips-list">
                  {activeTrips.map(trip => (
                    <div key={trip.tripBookingId} className="trip-card active">
                      <div className="trip-content">
                        <div className="trip-header">
                          <div className="trip-id">
                            <span>行程ID: </span>
                            <strong>{trip.tripBookingId}</strong>
                          </div>
                          <span className="status-badge active">进行中</span>
                        </div>
                        
                        <div className="trip-route">
                          <div className="route-from">
                            <span className="route-label">出发地:</span>
                            <p className="route-value">{trip.fromLocation}</p>
                          </div>
                          <div className="route-arrow">→</div>
                          <div className="route-to">
                            <span className="route-label">目的地:</span>
                            <p className="route-value">{trip.toLocation}</p>
                          </div>
                        </div>
                        
                        {trip.driver ? (
                          <div className="driver-info">
                            <div className="driver-avatar">
                              {trip.driver.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="driver-details">
                              <p className="driver-name">{trip.driver.username}</p>
                              <div className="driver-meta">
                                <span>评分: {trip.driver.rating} ⭐</span>
                                <span>•</span>
                                <span>车辆: {trip.driver.cab?.carType}</span>
                                <span>•</span>
                                <span>费率: {trip.driver.cab?.ratePerKm}元/公里</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="driver-waiting">
                            <span className="waiting-icon">⏳</span>
                            <span>等待系统分配司机...</span>
                          </div>
                        )}
                        
                        <div className="trip-meta">
                          <div className="meta-item">
                            <span>距离:</span>
                            <strong>{trip.km} 公里</strong>
                          </div>
                          <div className="meta-item">
                            <span>预估费用:</span>
                            <strong className="price">{trip.totalAmount} 元</strong>
                          </div>
                          <div className="meta-item">
                            <span>出发时间:</span>
                            <strong>{formatTripDate(trip.fromDateTime)}</strong>
                          </div>
                          <div className="meta-item">
                            <span>状态:</span>
                            <strong className={trip.driver ? 'status-assigned' : 'status-waiting'}>
                              {trip.driver ? '司机已接单' : '等待接单'}
                            </strong>
                          </div>
                        </div>
                        
                        <div className="trip-footer">
                          <span className="payment-status">
                            支付状态: {trip.payment ? '已支付' : '未支付'} | 
                            行程状态: {trip.payment ? '已完成' : '进行中'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="trip-actions">
                        <button
                          onClick={() => handleCancelTrip(trip.tripBookingId)}
                          className="btn btn-danger"
                        >
                          取消行程
                        </button>
                        <div className="action-note">
                          {trip.driver ? '司机完成后自动结算' : '取消后重新预订'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 历史行程标签页 */}
        {activeTab === 'history' && (
          <div className="content-card">
            <div className="card-header">
              <div className="card-header-row">
                <h3>
                  历史行程
                  {tripHistory.length > 0 && (
                    <span className="badge-count">({tripHistory.length}个已完成)</span>
                  )}
                </h3>
                <button
                  onClick={refreshActiveTrips}
                  className="btn btn-outline"
                >
                  刷新
                </button>
              </div>
            </div>
            
            <div className="card-body">
              {tripHistory.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <p>暂无历史行程记录</p>
                  <p className="empty-description">完成的行程将显示在这里</p>
                </div>
              ) : (
                <div className="history-list">
                  {tripHistory.map(trip => (
                    <div key={trip.tripBookingId} className="history-card">
                      <div className="history-header">
                        <div className="history-id">
                          <span>行程ID: </span>
                          <strong>{trip.tripBookingId}</strong>
                        </div>
                        <span className="status-badge completed">已完成</span>
                      </div>
                      
                      <div className="history-route">
                        <div className="route-from">
                          <span className="route-label">出发地:</span>
                          <p className="route-value">{trip.fromLocation}</p>
                        </div>
                        <div className="route-arrow">→</div>
                        <div className="route-to">
                          <span className="route-label">目的地:</span>
                          <p className="route-value">{trip.toLocation}</p>
                        </div>
                      </div>
                      
                      {trip.driver && (
                        <div className="history-driver">
                          <div className="driver-avatar small">
                            {trip.driver.username?.charAt(0).toUpperCase()}
                          </div>
                          <div className="driver-info-compact">
                            <span className="driver-name">{trip.driver.username}</span>
                            <span className="driver-rating">{trip.driver.rating} ⭐</span>
                            <span className="driver-car">{trip.driver.cab?.carType}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="history-details">
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">距离:</span>
                            <span className="detail-value">{trip.km} 公里</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">实际费用:</span>
                            <span className="detail-value price">{trip.totalAmount} 元</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">完成时间:</span>
                            <span className="detail-value">{formatDateOnly(trip.toDateTime)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">支付状态:</span>
                            <span className="detail-value success">已支付</span>
                          </div>
                        </div>
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
          <div className="content-card">
            <div className="card-header">
              <div className="card-header-row">
                <h3>个人信息</h3>
                <button
                  onClick={handleEditToggle}
                  className={`btn ${editing ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {editing ? '取消编辑' : '编辑信息'}
                </button>
              </div>
            </div>
            
            <div className="card-body">
              <div className="profile-form">
                <div className="form-section">
                  <h4 className="section-title">基本信息</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">用户名</label>
                      <input
                        type="text"
                        value={customerInfo.username}
                        disabled
                        className="form-input disabled"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">手机号</label>
                      {editing ? (
                        <input
                          type="tel"
                          name="mobile"
                          value={editForm.mobile}
                          onChange={handleEditChange}
                          className="form-input"
                          placeholder="请输入手机号"
                        />
                      ) : (
                        <div className="info-value">{customerInfo.mobile}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">邮箱</label>
                      {editing ? (
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleEditChange}
                          className="form-input"
                          placeholder="请输入邮箱"
                        />
                      ) : (
                        <div className="info-value">{customerInfo.email}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">旅程状态</label>
                      <div className="status-display">
                        <div className={`status-indicator ${activeTrips.length > 0 ? 'active' : 'idle'}`}></div>
                        <span>{activeTrips.length > 0 ? '旅程进行中' : '空闲'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4 className="section-title">地址信息</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">城市</label>
                      {editing ? (
                        <input
                          type="text"
                          name="address.city"
                          value={editForm.address?.city || ''}
                          onChange={handleEditChange}
                          className="form-input"
                          placeholder="请输入城市"
                        />
                      ) : (
                        <div className="info-value">{customerInfo.address?.city || '未设置'}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">省份</label>
                      {editing ? (
                        <input
                          type="text"
                          name="address.state"
                          value={editForm.address?.state || ''}
                          onChange={handleEditChange}
                          className="form-input"
                          placeholder="请输入省份"
                        />
                      ) : (
                        <div className="info-value">{customerInfo.address?.state || '未设置'}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">邮编</label>
                      {editing ? (
                        <input
                          type="text"
                          name="address.pincode"
                          value={editForm.address?.pincode || ''}
                          onChange={handleEditChange}
                          className="form-input"
                          placeholder="请输入邮编"
                        />
                      ) : (
                        <div className="info-value">{customerInfo.address?.pincode || '未设置'}</div>
                      )}
                    </div>
                  </div>
                </div>

                {editing && (
                  <div className="form-actions">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn btn-primary"
                    >
                      {saving ? (
                        <>
                          <span className="loading-spinner-small"></span>
                          保存中...
                        </>
                      ) : (
                        '保存更改'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 附近司机标签页 */}
        {activeTab === 'drivers' && (
          <div className="content-card">
            <div className="card-header">
              <div className="card-header-row">
                <h3>
                  附近司机
                  {availableDrivers.length > 0 && (
                    <span className="badge-count">({availableDrivers.length}位可用)</span>
                  )}
                </h3>
                <button
                  onClick={handleRefreshDrivers}
                  className="btn btn-outline"
                >
                  刷新
                </button>
              </div>
            </div>
            
            <div className="card-body">
              {availableDrivers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🚗</div>
                  <p>暂无可用司机</p>
                  <p className="empty-description">请稍后刷新或联系客服</p>
                  <button
                    onClick={handleRefreshDrivers}
                    className="btn btn-primary"
                  >
                    重新加载
                  </button>
                </div>
              ) : (
                <div className="drivers-grid">
                  {availableDrivers.map(driver => (
                    <div key={driver.userId} className="driver-card">
                      <div className="driver-header">
                        <div className="driver-avatar large">
                          {driver.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="driver-info-main">
                          <h4 className="driver-name">{driver.username}</h4>
                          <div className="driver-rating">
                            <span className="stars">⭐</span>
                            <span className="rating-value">{driver.rating}</span>
                            {driver.available && (
                              <span className="availability-badge">可接单</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="driver-details">
                        <div className="detail-row">
                          <span className="detail-label">车型:</span>
                          <span className="detail-value">{driver.cab?.carType || '未设置'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">费率:</span>
                          <span className="detail-value">{driver.cab?.ratePerKm || '0'} 元/公里</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">经验:</span>
                          <span className="detail-value">
                            {driver.rating >= 4.5 ? '金牌司机' : 
                             driver.rating >= 4.0 ? '优质司机' : '普通司机'}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">联系方式:</span>
                          <span className="detail-value">{driver.mobile}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setActiveTab('book')}
                        className="btn btn-primary full-width"
                      >
                        立即预订
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;