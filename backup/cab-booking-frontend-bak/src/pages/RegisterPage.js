import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    mobile: '',
    email: '',
    userType: 'customer',
    city: 'Минск',
    state: 'Минская область',
    pincode: '220000'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
  setSuccess('');

  // 前端验证
  if (formData.password.length < 4) {
    setError('Пароль должен содержать не менее 4 символов');
    setLoading(false);
    return;
  }

  if (formData.mobile.length !== 10 || !/^\d+$/.test(formData.mobile)) {
    setError('Номер телефона должен содержать ровно 10 цифр');
    setLoading(false);
    return;
  }

  try {
    // 构建符合后端期望的数据结构
    const customerData = {
      username: formData.username,
      password: formData.password,
      mobile: formData.mobile,
      email: formData.email,
      address: {
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      }
    };

    console.log('🔧 Registration attempt with data:', customerData);

    // 根据用户类型调用不同的注册API
    if (formData.userType === 'customer') {
      console.log('📤 Sending POST request to /save...');
      
      const response = await authAPI.registerCustomer(customerData);
      console.log('✅ Registration successful:', response);
      
      if (response.data && response.data.userId) {
        setSuccess(`Клиент успешно зарегистрирован! Ваш ID: ${response.data.userId}. Теперь вы можете войти в систему.`);
      } else {
        setSuccess('Клиент успешно зарегистрирован! Теперь вы можете войти в систему.');
      }

      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } else if (formData.userType === 'driver') {
      setSuccess('Для регистрации водителя требуется дополнительная информация. Пожалуйста, свяжитесь с администратором.');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }

  } catch (error) {
    console.error('❌ Registration failed:', error);
    
    // 更详细的错误信息
    if (error.response) {
      // 服务器返回了错误状态码
      console.log('📊 Server response details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      const errorMessage = error.response.data?.message || 
                          error.response.data?.error ||
                          'Ошибка регистрации. Пожалуйста, проверьте введенные данные.';
      setError(`Ошибка сервера (${error.response.status}): ${errorMessage}`);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.log('🔌 No response received. Request details:', error.request);
      setError('Сервер не ответил. Проверьте CORS настройки и логи сервера.');
    } else {
      // 其他错误
      setError(`Ошибка: ${error.message}`);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Регистрация в системе такси</h2>
        
        <div className="form-hints">
          <p><strong>Требования к данным:</strong></p>
          <ul>
            <li>Имя пользователя: минимум 3 символа</li>
            <li>Пароль: минимум 4 символа</li>
            <li>Телефон: ровно 10 цифр</li>
            <li>Email: должен быть действительным</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userType">Тип пользователя:</label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
            >
              <option value="customer">Пассажир</option>
              <option value="driver">Водитель</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="username">Имя пользователя *:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength="3"
              placeholder="Минимум 3 символа"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль *:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="4"
              placeholder="Минимум 4 символа"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Мобильный телефон *:</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              title="Ровно 10 цифр"
              placeholder="10 цифр, например: 291234567"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="city">Город *:</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="state">Область *:</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pincode">Почтовый индекс *:</label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <div className="error-message">
              <strong>Ошибка:</strong> {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <strong>Успех!</strong> {success}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="register-button"
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="login-link">
          <span>Уже есть аккаунт? </span>
          <Link to="/login">Войти</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;