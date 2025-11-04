import React, { useState, useEffect } from 'react';
import { customerAPI, cabAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import './CustomerDashboard.css';

const CustomerDashboard = ({ user, onLogout }) => {
  const [trips, setTrips] = useState([]);
  const [cabTypes, setCabTypes] = useState([]);
  const [showBookForm, setShowBookForm] = useState(false);
  const [newTrip, setNewTrip] = useState({
    from_location: '',
    to_location: '',
    fromdate_time: '',
    todate_time: '',
    km: 0
  });

  useEffect(() => {
    loadTrips();
    loadCabTypes();
  }, []);

  const loadTrips = async () => {
    try {
      const response = await customerAPI.getAllTrips();
      // 过滤当前用户的行程
      const userTrips = response.data.filter(trip => 
        trip.customerId === user.userId
      );
      setTrips(userTrips);
    } catch (error) {
      console.error('Ошибка загрузки поездок:', error);
    }
  };

  const loadCabTypes = async () => {
    try {
      const response = await cabAPI.getCabTypes();
      setCabTypes(response.data);
    } catch (error) {
      console.error('Ошибка загрузки типов такси:', error);
    }
  };

  const handleBookTrip = async (e) => {
  e.preventDefault();
  try {
    // 确保customerId正确传递
    const tripData = {
      customerId: user.userId,  // 确保这个字段存在且正确
      from_location: newTrip.from_location,
      to_location: newTrip.to_location,
      fromdate_time: newTrip.fromdate_time + 'T00:00:00',
      todate_time: newTrip.todate_time + 'T00:00:00',
      km: parseInt(newTrip.km)
    };

    console.log('📤 Sending trip booking data:', tripData);

    const response = await customerAPI.createTrip(tripData);
    console.log('✅ Trip booking successful:', response);
    
    setShowBookForm(false);
    setNewTrip({
      from_location: '',
      to_location: '',
      fromdate_time: '',
      todate_time: '',
      km: 0
    });
    loadTrips(); // 重新加载行程列表
    alert('Поездка успешно забронирована!');
  } catch (error) {
    console.error('❌ Trip booking error:', error);
    console.error('Error details:', error.response?.data);
    alert('Ошибка бронирования поездки: ' + (error.response?.data?.message || error.message));
  }
};

  const handleEndTrip = async (tripId) => {
    try {
      await customerAPI.endTrip(tripId);
      loadTrips(); // 重新加载行程列表
      alert('Поездка завершена!');
    } catch (error) {
      console.error('Ошибка завершения поездки:', error);
      alert('Ошибка завершения поездки');
    }
  };

  return (
    <div className="customer-dashboard">
      <header className="dashboard-header">
        <h1>Панель пассажира</h1>
        <div className="user-info">
          <span>Добро пожаловать, {user.username}!</span>
          <button onClick={onLogout} className="logout-button">Выйти</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="quick-actions">
          <button 
            onClick={() => setShowBookForm(!showBookForm)}
            className="action-button"
          >
            {showBookForm ? 'Отменить' : 'Заказать такси'}
          </button>
        </div>

        {showBookForm && (
          <div className="booking-form">
            <h3>Заказ такси</h3>
            <form onSubmit={handleBookTrip}>
              <div className="form-row">
                <div className="form-group">
                  <label>Откуда:</label>
                  <input
                    type="text"
                    value={newTrip.from_location}
                    onChange={(e) => setNewTrip({...newTrip, from_location: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Куда:</label>
                  <input
                    type="text"
                    value={newTrip.to_location}
                    onChange={(e) => setNewTrip({...newTrip, to_location: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Дата отправления:</label>
                  <input
                    type="date"
                    value={newTrip.fromdate_time}
                    onChange={(e) => setNewTrip({...newTrip, fromdate_time: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Дата прибытия:</label>
                  <input
                    type="date"
                    value={newTrip.todate_time}
                    onChange={(e) => setNewTrip({...newTrip, todate_time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Расстояние (км):</label>
                <input
                  type="number"
                  value={newTrip.km}
                  onChange={(e) => setNewTrip({...newTrip, km: parseInt(e.target.value)})}
                  required
                  min="1"
                />
              </div>

              <button type="submit" className="submit-button">
                Подтвердить заказ
              </button>
            </form>
          </div>
        )}

        <div className="trips-section">
          <h3>Мои поездки</h3>
          {trips.length === 0 ? (
            <p>У вас пока нет поездок</p>
          ) : (
            <div className="trips-list">
              {trips.map(trip => (
                <div key={trip.tripBookingId} className="trip-card">
                  <div className="trip-info">
                    <p><strong>Маршрут:</strong> {trip.from_location} → {trip.to_location}</p>
                    <p><strong>Дата:</strong> {trip.fromdate_time}</p>
                    <p><strong>Стоимость:</strong> {formatCurrency(trip.totalamount)}</p>
                    <p><strong>Статус оплаты:</strong> {trip.payment ? 'Оплачено' : 'Не оплачено'}</p>
                  </div>
                  {!trip.payment && (
                    <button 
                      onClick={() => handleEndTrip(trip.tripBookingId)}
                      className="end-trip-button"
                    >
                      Завершить поездку
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cab-types">
          <h3>Доступные типы такси</h3>
          <div className="types-list">
            {cabTypes.map((type, index) => (
              <div key={index} className="type-card">
                {type}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;