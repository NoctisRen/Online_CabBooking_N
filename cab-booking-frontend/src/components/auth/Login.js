// src/components/auth/Login.js - 优雅风格重构版本
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { validationRules, validateForm } from '../../utils/validation';

const Login = ({ onSwitchToRegister, onSwitchToDriverRegister, onBackToWelcome }) => {
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  });
  const [userType, setUserType] = useState('customer');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData, {
      userId: validationRules.userId,
      password: { required: '密码不能为空' }
    });
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const loginData = {
        userId: parseInt(formData.userId),
        password: formData.password
      };

      console.log('发送登录请求:', loginData);
      const result = await authService.login(loginData);
      console.log('登录响应:', result);
      
      login(loginData, result, userType);
      
      alert(`${userType === 'driver' ? '司机' : '用户'}登录成功！`);
      
      window.location.href = '/';
      
    } catch (error) {
      console.error('登录错误:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('用户不存在') && userType === 'driver') {
        errorMessage = '司机账号不存在，请确认司机ID是否正确';
      } else if (error.message.includes('用户不存在')) {
        errorMessage = '用户账号不存在，请确认用户ID是否正确';
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <button onClick={onBackToWelcome} className="back-button">
            <svg className="back-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
            返回
          </button>
          <div className="login-title">
            <h1>用户登录</h1>
            <p>欢迎回到网约车平台</p>
          </div>
        </div>

        {/* 用户类型选择 */}
        <div className="user-type-selector">
          <div className="selector-tabs">
            <button
              type="button"
              onClick={() => handleUserTypeChange('customer')}
              className={`tab-button ${userType === 'customer' ? 'active' : ''}`}
            >
              <div className="tab-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <span>乘客登录</span>
            </button>
            <button
              type="button"
              onClick={() => handleUserTypeChange('driver')}
              className={`tab-button ${userType === 'driver' ? 'active' : ''}`}
            >
              <div className="tab-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                </svg>
              </div>
              <span>司机登录</span>
            </button>
          </div>
          {userType === 'driver' && (
            <div className="driver-notice">
              <svg className="notice-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>司机专用登录通道</span>
            </div>
          )}
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userId" className="form-label">
              {userType === 'driver' ? '司机ID' : '用户ID'}
            </label>
            <input
              id="userId"
              name="userId"
              type="text"
              value={formData.userId}
              onChange={handleChange}
              className={`form-input ${errors.userId ? 'error' : ''}`}
              placeholder={`请输入${userType === 'driver' ? '司机' : '用户'}ID`}
            />
            {errors.userId && (
              <div className="error-message">
                <svg className="error-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {errors.userId}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">密码</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="请输入密码"
            />
            {errors.password && (
              <div className="error-message">
                <svg className="error-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {errors.password}
              </div>
            )}
          </div>

          {errors.submit && (
            <div className="submit-error">
              <svg className="submit-error-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`login-button ${userType === 'driver' ? 'driver' : 'customer'} ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <svg className="loading-spinner" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
                登录中...
              </>
            ) : (
              userType === 'driver' ? '司机登录' : '乘客登录'
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="footer-links">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="footer-link"
            >
              没有乘客账号？立即注册
            </button>
            <button
              type="button"
              onClick={onSwitchToDriverRegister}
              className="footer-link driver-link"
            >
              成为司机？注册司机账户
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .login-content {
          background: white;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 450px;
        }

        .login-header {
          margin-bottom: 30px;
          position: relative;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: #667eea;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 5px 0;
          transition: color 0.3s ease;
        }

        .back-button:hover {
          color: #5a6fd8;
        }

        .back-icon {
          width: 18px;
          height: 18px;
        }

        .login-title {
          text-align: center;
          margin-top: 10px;
        }

        .login-title h1 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 1.8rem;
          font-weight: 600;
        }

        .login-title p {
          margin: 0;
          color: #666;
          font-size: 1rem;
        }

        .user-type-selector {
          margin-bottom: 30px;
        }

        .selector-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }

        .tab-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px 20px;
          border: 2px solid #e1e5e9;
          border-radius: 10px;
          background: white;
          color: #666;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-button:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .tab-button.active {
          border-color: #667eea;
          background: #667eea;
          color: white;
        }

        .tab-button.active.driver {
          border-color: #28a745;
          background: #28a745;
        }

        .tab-icon {
          width: 20px;
          height: 20px;
        }

        .driver-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          background: #e8f5e8;
          border: 1px solid #28a745;
          border-radius: 8px;
          color: #28a745;
          font-size: 0.9rem;
        }

        .notice-icon {
          width: 16px;
          height: 16px;
        }

        .login-form {
          margin-bottom: 30px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .form-input {
          width: 100%;
          padding: 15px;
          border: 2px solid #e1e5e9;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input.error {
          border-color: #e74c3c;
        }

        .form-input.error:focus {
          border-color: #e74c3c;
          box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          color: #e74c3c;
          font-size: 0.85rem;
        }

        .error-icon {
          width: 16px;
          height: 16px;
        }

        .submit-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px;
          background: #ffeaea;
          border: 1px solid #e74c3c;
          border-radius: 10px;
          color: #e74c3c;
          font-size: 0.9rem;
          margin-bottom: 20px;
        }

        .submit-error-icon {
          width: 18px;
          height: 18px;
        }

        .login-button {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 10px;
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .login-button.customer {
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .login-button.driver {
          background: linear-gradient(135deg, #28a745, #20c997);
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .login-footer {
          text-align: center;
        }

        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-link {
          background: none;
          border: none;
          color: #667eea;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 5px;
          transition: color 0.3s ease;
        }

        .footer-link:hover {
          color: #5a6fd8;
          text-decoration: underline;
        }

        .driver-link {
          color: #28a745;
        }

        .driver-link:hover {
          color: #218838;
        }

        @media (max-width: 480px) {
          .login-content {
            padding: 30px 20px;
          }
          
          .selector-tabs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;