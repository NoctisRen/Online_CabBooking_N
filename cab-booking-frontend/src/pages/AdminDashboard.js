import React, { useState, useEffect } from 'react';
import { adminAPI, cabAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  const [trips, setTrips] = useState([]);
  const [viewMode, setViewMode] = useState('all'); // all, driverwise, customerwise, datewise
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalRevenue: 0,
    activeDrivers: 0,
    registeredCustomers: 0
  });

  useEffect(() => {
    loadAllTrips();
    loadStats();
  }, []);

  const loadAllTrips = async () => {
    try {
      const response = await adminAPI.getTripsCustomerwise();
      setTrips(response.data);
    } catch (error) {
      console.error('Ошибка загрузки поездок:', error);
    }
  };

  const loadStats = async () => {
    try {
      // 模拟统计数据
      setStats({
        totalTrips: trips.length,
        totalRevenue: trips.reduce((sum, trip) => sum + (trip.totalamount || 0), 0),
        activeDrivers: 15,
        registeredCustomers: 89
      });
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  const handleViewChange = async (mode) => {
    setViewMode(mode);
    try {
      let response;
      switch (mode) {
        case 'driverwise':
          response = await adminAPI.getTripsDriverwise();
          break;
        case 'customerwise':
          response = await adminAPI.getTripsCustomerwise();
          break;
        case 'datewise':
          response = await adminAPI.getTripsDatewise();
          break;
        default:
          response = await adminAPI.getTripsCustomerwise();
      }
      setTrips(response.data);
    } catch (error) {
      console.error('Ошибка загрузки поездок:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Панель администратора</h1>
        <div className="user-info">
          <span>Добро пожаловать, {user.username}!</span>
          <button onClick={onLogout} className="logout-button">Выйти</button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Статистика */}
        <div className="stats-section">
          <h3>Общая статистика</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🚗</div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalTrips}</div>
                <div className="stat-label">Всего поездок</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
                <div className="stat-label">Общий доход</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👨‍✈️</div>
              <div className="stat-info">
                <div className="stat-value">{stats.activeDrivers}</div>
                <div className="stat-label">Активные водители</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-value">{stats.registeredCustomers}</div>
                <div className="stat-label">Зарегистрированные клиенты</div>
              </div>
            </div>
          </div>
        </div>

        {/* Фильтры просмотра */}
        <div className="view-controls">
          <h3>Просмотр поездок</h3>
          <div className="filter-buttons">
            <button 
              className={`filter-button ${viewMode === 'all' ? 'active' : ''}`}
              onClick={() => handleViewChange('all')}
            >
              Все поездки
            </button>
            <button 
              className={`filter-button ${viewMode === 'driverwise' ? 'active' : ''}`}
              onClick={() => handleViewChange('driverwise')}
            >
              По водителям
            </button>
            <button 
              className={`filter-button ${viewMode === 'customerwise' ? 'active' : ''}`}
              onClick={() => handleViewChange('customerwise')}
            >
              По клиентам
            </button>
            <button 
              className={`filter-button ${viewMode === 'datewise' ? 'active' : ''}`}
              onClick={() => handleViewChange('datewise')}
            >
              По датам
            </button>
          </div>
        </div>

        {/* Список поездок */}
        <div className="trips-section">
          <h3>Список поездок ({trips.length})</h3>
          {trips.length === 0 ? (
            <div className="no-data">
              <p>Нет данных о поездках</p>
            </div>
          ) : (
            <div className="trips-table">
              <table>
                <thead>
                  <tr>
                    <th>ID поездки</th>
                    <th>ID клиента</th>
                    <th>Маршрут</th>
                    <th>Дата</th>
                    <th>Стоимость</th>
                    <th>Статус оплаты</th>
                    <th>Водитель</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map(trip => (
                    <tr key={trip.tripBookingId}>
                      <td>#{trip.tripBookingId}</td>
                      <td>{trip.customerId}</td>
                      <td>
                        <div className="route-info">
                          <div className="from">{trip.from_location}</div>
                          <div className="arrow">→</div>
                          <div className="to">{trip.to_location}</div>
                        </div>
                      </td>
                      <td>{formatDate(trip.fromdate_time)}</td>
                      <td className="amount">{formatCurrency(trip.totalamount)}</td>
                      <td>
                        <span className={`payment-status ${trip.payment ? 'paid' : 'unpaid'}`}>
                          {trip.payment ? 'Оплачено' : 'Не оплачено'}
                        </span>
                      </td>
                      <td>
                        {trip.driver ? `Водитель #${trip.driver.userId}` : 'Не назначен'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Быстрые действия */}
        <div className="quick-actions">
          <h3>Быстрые действия</h3>
          <div className="action-buttons">
            <button className="action-button">
              📊 Скачать отчет
            </button>
            <button className="action-button">
              👨‍✈️ Управление водителями
            </button>
            <button className="action-button">
              👥 Управление клиентами
            </button>
            <button className="action-button">
              ⚙️ Настройки системы
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;