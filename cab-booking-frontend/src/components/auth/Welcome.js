// src/components/auth/Welcome.js - 修复版本
import React from 'react';
import './Welcome.css'; // 改为外部CSS文件

const Welcome = ({ onCustomerLogin, onDriverLogin, onCustomerRegister, onDriverRegister, onAdminLogin }) => {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="welcome-header">
          <div className="logo">
            <div className="logo-icon">🚗</div>
            <h1>网约车平台</h1>
          </div>
          <p className="welcome-subtitle">选择您的身份开始使用</p>
        </div>

        <div className="welcome-cards">
          {/* 乘客卡片 */}
          <div className="welcome-card customer-card">
            <div className="card-header">
              <div className="card-icon">
                <div className="icon-circle customer-icon">
                  <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              </div>
              <div className="card-title">
                <h3>乘客</h3>
                <p>快速叫车，便捷出行</p>
              </div>
            </div>
            <div className="card-actions">
              <button 
                onClick={onCustomerLogin}
                className="btn btn-primary"
              >
                乘客登录
              </button>
              <button 
                onClick={onCustomerRegister}
                className="btn btn-secondary"
              >
                注册乘客
              </button>
            </div>
          </div>

          {/* 司机卡片 */}
          <div className="welcome-card driver-card">
            <div className="card-header">
              <div className="card-icon">
                <div className="icon-circle driver-icon">
                  <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                  </svg>
                </div>
              </div>
              <div className="card-title">
                <h3>司机</h3>
                <p>接单服务，收入稳定</p>
              </div>
            </div>
            <div className="card-actions">
              <button 
                onClick={onDriverLogin}
                className="btn btn-primary"
              >
                司机登录
              </button>
              <button 
                onClick={onDriverRegister}
                className="btn btn-secondary"
              >
                注册司机
              </button>
            </div>
          </div>
        </div>

        {/* 管理员入口 */}
        <div className="admin-entry">
          <div className="admin-divider">
            <span>系统管理</span>
          </div>
          <button 
            onClick={onAdminLogin}
            className="admin-login-btn"
          >
            <div className="admin-btn-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.1 3.89 21 5 21H19C20.11 21 21 20.11 21 19V9H19V9ZM19 9H15V3L19 7V9Z"/>
              </svg>
            </div>
            <span>管理员登录</span>
          </button>
        </div>

        <div className="welcome-footer">
          <p>选择相应身份开始使用网约车平台</p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;