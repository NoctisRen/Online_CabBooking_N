import React, { useState, useEffect } from 'react';
import { driverAPI } from '../services/api';
import './DriverDashboard.css';

const DriverDashboard = ({ user, onLogout }) => {
  const [driverInfo, setDriverInfo] = useState(null);
  const [available, setAvailable] = useState(true);
  const [assignedTrips, setAssignedTrips] = useState([]);

  useEffect(() => {
    loadDriverInfo();
    loadAssignedTrips();
  }, []);

  const loadDriverInfo = async () => {
    try {
      const response = await driverAPI.getDriver(user.userId);
      setDriverInfo(response.data);
      setAvailable(response.data.available);
    } catch (error) {
      console.error('Ошибка загрузки информации о водителе:', error);
    }
  };

  const loadAssignedTrips = async () => {
    try {
      // 这里应该调用获取分配给该司机的行程的API
      // 由于后端没有直接提供这个API，我们暂时模拟数据
      const mockTrips = [
        {
          tripBookingId: 1,
          customerId: 101,
          from_location: 'Минск, пр. Независимости',
          to_location: 'Минск-Арена',
          fromdate_time: '2024-01-15',
          totalamount: 25
        }
      ];
      setAssignedTrips(mockTrips);
    } catch (error) {
      console.error('Ошибка загрузки назначенных поездок:', error);
    }
  };

  const handleAvailabilityToggle = async () => {
    try {
      await driverAPI.updateDriver(
        user.userId,
        driverInfo.licenseNo,
        !available
      );
      setAvailable(!available);
      alert(`Статус изменен: ${!available ? 'Доступен' : 'Недоступен'}`);
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      alert('Ошибка изменения статуса');
    }
  };

  return (
    <div className="driver-dashboard">
      <header className="dashboard-header">
        <h1>Панель водителя</h1>
        <div className="user-info">
          <span>Добро пожаловать, {user.username}!</span>
          <button onClick={onLogout} className="logout-button">Выйти</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="driver-status">
          <h3>Мой статус</h3>
          <div className="status-card">
            <div className="status-info">
              <p><strong>Имя:</strong> {driverInfo?.username || user.username}</p>
              <p><strong>Рейтинг:</strong> {driverInfo?.rating || '4.8'} ⭐</p>
              <p><strong>Лицензия:</strong> {driverInfo?.licenseNo || 'ABC123'}</p>
              <p><strong>Тип такси:</strong> {driverInfo?.cab?.carType || 'Стандарт'}</p>
              <p><strong>Тариф:</strong> {driverInfo?.cab?.ratePerKm || '2'} BYN/км</p>
            </div>
            <div className="availability-toggle">
              <label>Статус доступности:</label>
              <button 
                onClick={handleAvailabilityToggle}
                className={`availability-button ${available ? 'available' : 'unavailable'}`}
              >
                {available ? 'Доступен' : 'Недоступен'}
              </button>
            </div>
          </div>
        </div>

        <div className="assigned-trips">
          <h3>Назначенные поездки</h3>
          {assignedTrips.length === 0 ? (
            <div className="no-trips">
              <p>На данный момент нет назначенных поездок</p>
              <p className="hint">Будьте доступны для получения новых заказов</p>
            </div>
          ) : (
            <div className="trips-list">
              {assignedTrips.map(trip => (
                <div key={trip.tripBookingId} className="trip-card">
                  <div className="trip-info">
                    <p><strong>Заказ #{trip.tripBookingId}</strong></p>
                    <p><strong>Маршрут:</strong> {trip.from_location} → {trip.to_location}</p>
                    <p><strong>Дата:</strong> {trip.fromdate_time}</p>
                    <p><strong>Ориентировочная стоимость:</strong> {trip.totalamount} BYN</p>
                  </div>
                  <div className="trip-actions">
                    <button className="accept-button">Принять заказ</button>
                    <button className="navigate-button">Проложить маршрут</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="quick-stats">
          <h3>Статистика за сегодня</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">5</div>
              <div className="stat-label">Завершенные поездки</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">125</div>
              <div className="stat-label">Заработано (BYN)</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">4.9</div>
              <div className="stat-label">Рейтинг</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">62</div>
              <div className="stat-label">Километры</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;