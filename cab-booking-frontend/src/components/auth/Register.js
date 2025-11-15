// src/components/auth/Register.js - 优雅风格优化版本
import React, { useState } from 'react';
import { customerService } from '../../services/customerService';
import { validationRules, validateForm } from '../../utils/validation';

const Register = ({ onSwitchToLogin, onSwitchToDriverRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    mobile: '',
    email: '',
    address: {
      city: '',
      state: '',
      pincode: ''
    },
    journey_status: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData(prev => ({
      ...prev,
      journey_status: e.target.checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 表单验证
    const validationErrors = validateForm(formData, {
      username: validationRules.username,
      password: validationRules.password,
      mobile: validationRules.mobile,
      email: validationRules.email
    });
    
    if (!formData.address.city.trim()) {
      validationErrors['address.city'] = '城市不能为空';
    }
    if (!formData.address.state.trim()) {
      validationErrors['address.state'] = '省份不能为空';
    }
    if (!formData.address.pincode.trim()) {
      validationErrors['address.pincode'] = '邮编不能为空';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('发送注册请求到后端...');
      
      const response = await customerService.register(formData);
      console.log('后端响应:', response);
      
      const userId = response.userId || response.id || response.customerId;
      
      if (userId) {
        setRegisteredUser({
          userId: userId,
          username: formData.username,
          email: formData.email
        });
        setSuccess(true);
      } else {
        throw new Error('注册成功但未获取到用户ID，响应数据: ' + JSON.stringify(response));
      }
      
    } catch (error) {
      console.error('注册API错误:', error);
      setErrors({ 
        submit: error.message || '注册失败，请检查网络连接和后端服务' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUserId = async () => {
    if (!registeredUser?.userId) return;
    
    const userId = registeredUser.userId.toString();
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(userId);
        setCopySuccess('用户ID已复制到剪贴板！');
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = userId;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopySuccess('用户ID已复制到剪贴板！');
        } else {
          setCopySuccess('请手动复制用户ID: ' + userId);
        }
      }
      
      setTimeout(() => setCopySuccess(''), 3000);
    } catch (err) {
      console.error('复制失败:', err);
      setCopySuccess('复制失败，请手动记录用户ID: ' + userId);
      setTimeout(() => setCopySuccess(''), 3000);
    }
  };

  const handleGoToLogin = () => {
    onSwitchToLogin();
  };

  const handleRegisterAnother = () => {
    setSuccess(false);
    setRegisteredUser(null);
    setFormData({
      username: '',
      password: '',
      mobile: '',
      email: '',
      address: {
        city: '',
        state: '',
        pincode: ''
      },
      journey_status: false
    });
    setCopySuccess('');
  };

  if (success) {
    return (
      <div className="register-container">
        <div className="register-content">
          <div className="success-header">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <h2>注册成功！</h2>
            <p className="success-subtitle">请保存您的用户ID用于登录</p>
          </div>

          <div className="success-card">
            <div className="user-id-section">
              <label className="user-id-label">您的用户ID</label>
              <div className="user-id-display">
                <span className="user-id-value">{registeredUser?.userId}</span>
                <button
                  onClick={handleCopyUserId}
                  className="copy-button"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                  </svg>
                  复制
                </button>
              </div>
              {copySuccess && (
                <div className="copy-message">
                  <p className={copySuccess.includes('失败') ? 'error' : 'success'}>
                    {copySuccess}
                  </p>
                </div>
              )}
            </div>

            <div className="user-info-card">
              <h3 className="info-title">注册信息</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">用户名:</span>
                  <span className="info-value">{registeredUser?.username}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">邮箱:</span>
                  <span className="info-value">{registeredUser?.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button
              onClick={handleGoToLogin}
              className="btn btn-primary"
            >
              立即登录
            </button>
            <button
              onClick={handleRegisterAnother}
              className="btn btn-secondary"
            >
              再注册一个
            </button>
          </div>
        </div>

        <style jsx>{`
          .register-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }

          .register-content {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 500px;
            text-align: center;
          }

          .success-header {
            margin-bottom: 30px;
          }

          .success-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #28a745, #20c997);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
          }

          .success-icon svg {
            width: 40px;
            height: 40px;
            color: white;
          }

          .success-header h2 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 1.8rem;
            font-weight: 600;
          }

          .success-subtitle {
            color: #666;
            margin: 0;
          }

          .success-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
          }

          .user-id-section {
            margin-bottom: 25px;
          }

          .user-id-label {
            display: block;
            font-weight: 500;
            color: #333;
            margin-bottom: 15px;
            font-size: 1.1rem;
          }

          .user-id-display {
            display: flex;
            align-items: center;
            gap: 15px;
            justify-content: center;
          }

          .user-id-value {
            font-size: 1.8rem;
            font-weight: 700;
            color: #667eea;
            background: white;
            padding: 15px 25px;
            border-radius: 10px;
            border: 2px solid #e9ecef;
          }

          .copy-button {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .copy-button:hover {
            background: #5a6fd8;
            transform: translateY(-2px);
          }

          .copy-button svg {
            width: 16px;
            height: 16px;
          }

          .copy-message {
            margin-top: 15px;
          }

          .copy-message .success {
            color: #28a745;
            font-size: 0.9rem;
          }

          .copy-message .error {
            color: #dc3545;
            font-size: 0.9rem;
          }

          .user-info-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
          }

          .info-title {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 1.1rem;
            font-weight: 600;
          }

          .info-grid {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .info-label {
            color: #666;
            font-weight: 500;
          }

          .info-value {
            color: #333;
            font-weight: 600;
          }

          .action-buttons {
            display: flex;
            gap: 15px;
          }

          .btn {
            flex: 1;
            padding: 15px 20px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .btn-primary {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
          }

          .btn-secondary {
            background: #e9ecef;
            color: #495057;
          }

          .btn-secondary:hover {
            background: #dee2e6;
            transform: translateY(-2px);
          }

          @media (max-width: 768px) {
            .register-content {
              padding: 30px 20px;
            }
            
            .user-id-display {
              flex-direction: column;
            }
            
            .action-buttons {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-content">
        <div className="register-header">
          <h2>客户注册</h2>
          <p className="register-subtitle">创建您的网约车账户</p>
        </div>
        
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-sections">
            {/* 基本信息部分 */}
            <div className="form-section">
              <h3 className="section-title">基本信息</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    用户名 *
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    className={`form-input ${errors.username ? 'error' : ''}`}
                    placeholder="请输入用户名"
                  />
                  {errors.username && (
                    <p className="error-message">{errors.username}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    密码 *
                  </label>
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
                    <p className="error-message">{errors.password}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="mobile" className="form-label">
                    手机号 *
                  </label>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleChange}
                    className={`form-input ${errors.mobile ? 'error' : ''}`}
                    placeholder="请输入手机号"
                  />
                  {errors.mobile && (
                    <p className="error-message">{errors.mobile}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    邮箱 *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="请输入邮箱"
                  />
                  {errors.email && (
                    <p className="error-message">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 地址信息部分 */}
            <div className="form-section">
              <h3 className="section-title">地址信息</h3>
              <div className="address-grid">
                <div className="form-group">
                  <label htmlFor="address.city" className="form-label">
                    城市 *
                  </label>
                  <input
                    id="address.city"
                    name="address.city"
                    type="text"
                    value={formData.address.city}
                    onChange={handleChange}
                    className={`form-input ${errors['address.city'] ? 'error' : ''}`}
                    placeholder="城市"
                  />
                  {errors['address.city'] && (
                    <p className="error-message">{errors['address.city']}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="address.state" className="form-label">
                    省份 *
                  </label>
                  <input
                    id="address.state"
                    name="address.state"
                    type="text"
                    value={formData.address.state}
                    onChange={handleChange}
                    className={`form-input ${errors['address.state'] ? 'error' : ''}`}
                    placeholder="省份"
                  />
                  {errors['address.state'] && (
                    <p className="error-message">{errors['address.state']}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="address.pincode" className="form-label">
                    邮编 *
                  </label>
                  <input
                    id="address.pincode"
                    name="address.pincode"
                    type="text"
                    value={formData.address.pincode}
                    onChange={handleChange}
                    className={`form-input ${errors['address.pincode'] ? 'error' : ''}`}
                    placeholder="邮编"
                  />
                  {errors['address.pincode'] && (
                    <p className="error-message">{errors['address.pincode']}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 协议部分 */}
            <div className="form-section">
              <div className="agreement-group">
                <input
                  id="journey_status"
                  name="journey_status"
                  type="checkbox"
                  checked={formData.journey_status}
                  onChange={handleCheckboxChange}
                  className="agreement-checkbox"
                />
                <label htmlFor="journey_status" className="agreement-label">
                  我已阅读并同意服务条款
                </label>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="submit-error">
              <div className="error-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <div className="error-content">
                <h4>注册失败</h4>
                <p>{errors.submit}</p>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  注册中...
                </>
              ) : (
                '注册'
              )}
            </button>
          </div>

          <div className="form-footer">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="footer-link"
            >
              已有账号？立即登录
            </button>
            <button
              type="button"
              onClick={onSwitchToDriverRegister}
              className="footer-link driver-link"
            >
              注册司机账户
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .register-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .register-content {
          background: white;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 600px;
        }

        .register-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .register-header h2 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 1.8rem;
          font-weight: 600;
        }

        .register-subtitle {
          color: #666;
          margin: 0;
        }

        .form-sections {
          margin-bottom: 25px;
        }

        .form-section {
          margin-bottom: 30px;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 20px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #f1f3f4;
        }

        .form-grid {
          display: grid;
          gap: 20px;
        }

        .address-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-weight: 500;
          color: #333;
          margin-bottom: 8px;
          font-size: 0.95rem;
        }

        .form-input {
          padding: 12px 15px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: white;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input.error {
          border-color: #dc3545;
          box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
        }

        .error-message {
          color: #dc3545;
          font-size: 0.85rem;
          margin: 5px 0 0 0;
        }

        .agreement-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .agreement-checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
        }

        .agreement-label {
          color: #333;
          font-size: 0.95rem;
          cursor: pointer;
        }

        .submit-error {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
        }

        .error-icon {
          color: #dc3545;
          flex-shrink: 0;
        }

        .error-icon svg {
          width: 20px;
          height: 20px;
        }

        .error-content h4 {
          margin: 0 0 5px 0;
          color: #721c24;
          font-size: 1rem;
        }

        .error-content p {
          margin: 0;
          color: #721c24;
          font-size: 0.9rem;
        }

        .form-actions {
          margin-bottom: 20px;
        }

        .submit-button {
          width: 100%;
          padding: 15px 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .form-footer {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
        }

        .footer-link {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          font-size: 0.95rem;
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

        @media (max-width: 768px) {
          .register-content {
            padding: 30px 20px;
          }
          
          .address-grid {
            grid-template-columns: 1fr;
          }
          
          .form-footer {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;