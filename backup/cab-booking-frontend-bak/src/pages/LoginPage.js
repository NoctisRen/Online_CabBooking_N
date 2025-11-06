import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, customerAPI, driverAPI } from '../services/api';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 调用登录API
      const response = await authAPI.login({
        userId: parseInt(formData.userId),
        password: formData.password
      });

      // 登录成功，确定用户类型
      let userType = '';
      let userData = null;

      try {
        // 尝试作为客户获取信息
        userData = await customerAPI.getCustomer(parseInt(formData.userId));
        userType = 'customer';
      } catch (customerError) {
        try {
          // 尝试作为司机获取信息
          userData = await driverAPI.getDriver(parseInt(formData.userId));
          userType = 'driver';
        } catch (driverError) {
          // 可能是管理员或其他类型用户
          userType = 'admin';
          userData = { userId: parseInt(formData.userId), username: 'Администратор' };
        }
      }

      // 调用登录成功回调
      onLogin(userData, userType);
      navigate(`/${userType.toLowerCase()}`);

    } catch (error) {
      console.error('Ошибка входа:', error);
      setError('Неверный ID пользователя или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Вход в систему такси</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userId">ID пользователя:</label>
            <input
              type="number"
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="register-link">
          <span>Нет аккаунта? </span>
          <Link to="/register">Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;