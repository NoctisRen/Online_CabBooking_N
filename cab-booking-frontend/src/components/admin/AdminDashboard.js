// src/components/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalDrivers: 0,
    totalTrips: 0,
    activeTrips: 0,
    todayRevenue: 0
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      // 这里调用管理员服务获取数据
      const statsData = await adminService.getStats();
      const tripsData = await adminService.getRecentTrips();
      
      setStats(statsData);
      setRecentTrips(tripsData);
    } catch (error) {
      console.error('加载管理员数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>加载管理员数据中...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* 顶部导航栏 */}
      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-info">
            <h1>管理员工作台</h1>
            <p>系统管理面板</p>
          </div>
          <div className="admin-header-actions">
            <div className="admin-user-info">
              <span>管理员: {currentUser?.username}</span>
              <span className="admin-badge">ADMIN</span>
            </div>
            <button onClick={handleLogout} className="logout-button">
              退出登录
            </button>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="admin-tabs">
        <nav className="admin-tab-nav">
          {[
            { id: 'overview', name: '数据总览' },
            { id: 'users', name: '用户管理' },
            { id: 'drivers', name: '司机管理' },
            { id: 'trips', name: '行程管理' },
            { id: 'reports', name: '数据报表' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`admin-tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* 内容区域 */}
      <div className="admin-content">
        
        {/* 数据总览标签页 */}
        {activeTab === 'overview' && (
          <div className="admin-overview">
            {/* 统计卡片 */}
            <div className="stats-grid">
              <div className="stat-card revenue">
                <div className="stat-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91 2.56.62 4.18 1.63 4.18 3.71 0 1.76-1.39 2.83-3.13 3.16z"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>今日收入</h3>
                  <p className="stat-value">¥{stats.todayRevenue}</p>
                </div>
              </div>

              <div className="stat-card customers">
                <div className="stat-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>注册用户</h3>
                  <p className="stat-value">{stats.totalCustomers}</p>
                </div>
              </div>

              <div className="stat-card drivers">
                <div className="stat-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>在线司机</h3>
                  <p className="stat-value">{stats.totalDrivers}</p>
                </div>
              </div>

              <div className="stat-card trips">
                <div className="stat-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>进行中行程</h3>
                  <p className="stat-value">{stats.activeTrips}</p>
                </div>
              </div>
            </div>

            {/* 最近行程表格 */}
            <div className="recent-trips">
              <h3>最近行程</h3>
              <div className="trips-table">
                <table>
                  <thead>
                    <tr>
                      <th>行程ID</th>
                      <th>乘客</th>
                      <th>司机</th>
                      <th>路线</th>
                      <th>金额</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrips.map(trip => (
                      <tr key={trip.id}>
                        <td>#{trip.id}</td>
                        <td>{trip.customerName}</td>
                        <td>{trip.driverName}</td>
                        <td>{trip.route}</td>
                        <td>¥{trip.amount}</td>
                        <td>
                          <span className={`status-badge ${trip.status}`}>
                            {trip.status === 'completed' ? '已完成' : 
                             trip.status === 'active' ? '进行中' : '已取消'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 其他标签页内容... */}
        {activeTab === 'users' && (
          <div className="admin-section">
            <h2>用户管理</h2>
            <p>用户管理功能开发中...</p>
          </div>
        )}

        {activeTab === 'drivers' && (
          <div className="admin-section">
            <h2>司机管理</h2>
            <p>司机管理功能开发中...</p>
          </div>
        )}

        {activeTab === 'trips' && (
          <div className="admin-section">
            <h2>行程管理</h2>
            <p>行程管理功能开发中...</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="admin-section">
            <h2>数据报表</h2>
            <p>数据报表功能开发中...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;