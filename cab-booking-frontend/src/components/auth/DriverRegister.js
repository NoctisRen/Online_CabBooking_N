// src/components/auth/DriverRegister.js - 优雅风格优化版本
import React, { useState } from 'react';
import { driverService } from '../../services/driverService';
import { validationRules, validateForm, validateNestedFields } from '../../utils/validation';

const DriverRegister = ({ onSwitchToLogin, onSwitchToCustomerRegister }) => {
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
    licenseNo: '',
    rating: 5.0,
    available: true,
    cab: {
      carType: '',
      ratePerKm: ''
    }
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredDriver, setRegisteredDriver] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');

  // 修复剪贴板功能
  const handleCopyDriverId = async () => {
    if (!registeredDriver?.driverId) return;
    
    const driverId = registeredDriver.driverId.toString();
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(driverId);
        setCopySuccess('司机ID已复制到剪贴板！');
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = driverId;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopySuccess('司机ID已复制到剪贴板！');
        } else {
          setCopySuccess('请手动复制司机ID: ' + driverId);
        }
      }
      
      setTimeout(() => setCopySuccess(''), 3000);
    } catch (err) {
      console.error('复制失败:', err);
      setCopySuccess('复制失败，请手动记录司机ID: ' + driverId);
      setTimeout(() => setCopySuccess(''), 3000);
    }
  };

  const handleGoToLogin = () => {
    onSwitchToLogin();
  };

  const handleRegisterAnother = () => {
    setSuccess(false);
    setRegisteredDriver(null);
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
      licenseNo: '',
      rating: 5.0,
      available: true,
      cab: {
        carType: '',
        ratePerKm: ''
      }
    });
    setCopySuccess('');
  };

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
    } else if (name.startsWith('cab.')) {
      const cabField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        cab: {
          ...prev.cab,
          [cabField]: value
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 分步骤验证
    const basicErrors = validateForm(formData, {
      username: validationRules.username,
      password: validationRules.password,
      mobile: validationRules.mobile,
      email: validationRules.email,
      licenseNo: validationRules.licenseNo,
      rating: validationRules.rating
    });

    const cabErrors = validateForm(formData.cab, {
      carType: validationRules.carType,
      ratePerKm: validationRules.ratePerKm
    });

    const addressErrors = validateNestedFields(formData, {
      'address.city': { required: '城市不能为空' },
      'address.state': { required: '省份不能为空' },
      'address.pincode': { required: '邮编不能为空' }
    });

    // 合并所有错误
    const allErrors = {
      ...basicErrors,
      ...Object.keys(cabErrors).reduce((acc, key) => {
        acc[`cab.${key}`] = cabErrors[key];
        return acc;
      }, {}),
      ...addressErrors
    };
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('发送司机注册请求到后端...');
      
      const submitData = {
        username: formData.username,
        password: formData.password,
        mobile: formData.mobile,
        email: formData.email,
        address: formData.address,
        licenseNo: formData.licenseNo.toUpperCase(),
        rating: parseFloat(formData.rating) || 5.0,
        available: true,
        cab: {
          carType: formData.cab.carType,
          ratePerKm: parseInt(formData.cab.ratePerKm) || 10
        }
      };
      
      console.log('修正后的注册数据:', submitData);
      
      const response = await driverService.register(submitData);
      console.log('司机注册响应:', response);
      
      const driverId = response.userId || response.id || response.driverId;
      console.log('提取的司机ID:', driverId);
      
      if (driverId) {
        setRegisteredDriver({
          driverId: driverId,
          username: formData.username,
          email: formData.email,
          licenseNo: formData.licenseNo
        });
        console.log('设置成功状态，司机ID:', driverId);
        setSuccess(true);
      } else {
        console.error('无法获取司机ID，响应数据:', response);
        throw new Error('注册成功但未获取到司机ID，响应数据: ' + JSON.stringify(response));
      }
      
    } catch (error) {
      console.error('司机注册API错误:', error);
      setErrors({ 
        submit: error.message || '注册失败，请检查网络连接和后端服务' 
      });
    } finally {
      setLoading(false);
    }
  };

  // 成功页面渲染
  if (success) {
    return (
      <div className="success-container">
        <div className="success-content">
          <div className="success-header">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <h2>司机注册成功！</h2>
            <p>请保存您的司机ID用于登录</p>
          </div>

          <div className="success-card">
            <div className="driver-id-section">
              <label>您的司机ID</label>
              <div className="id-display">
                <span className="driver-id">{registeredDriver?.driverId || '未知'}</span>
                <button
                  onClick={handleCopyDriverId}
                  className="copy-btn"
                >
                  复制
                </button>
              </div>
              {copySuccess && (
                <div className={`copy-message ${copySuccess.includes('失败') ? 'error' : 'success'}`}>
                  {copySuccess}
                </div>
              )}
            </div>

            <div className="info-card">
              <h3>注册信息</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span>用户名:</span>
                  <strong>{registeredDriver?.username}</strong>
                </div>
                <div className="info-item">
                  <span>邮箱:</span>
                  <strong>{registeredDriver?.email}</strong>
                </div>
                <div className="info-item">
                  <span>驾照号码:</span>
                  <strong>{registeredDriver?.licenseNo}</strong>
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
          .success-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }

          .success-content {
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
          }

          .success-header p {
            margin: 0;
            color: #666;
          }

          .success-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
          }

          .driver-id-section {
            margin-bottom: 20px;
          }

          .driver-id-section label {
            display: block;
            margin-bottom: 10px;
            color: #333;
            font-weight: 500;
          }

          .id-display {
            display: flex;
            align-items: center;
            gap: 15px;
            justify-content: center;
          }

          .driver-id {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
            background: white;
            padding: 10px 20px;
            border-radius: 8px;
            border: 2px solid #e9ecef;
          }

          .copy-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .copy-btn:hover {
            background: #5a6fd8;
            transform: translateY(-2px);
          }

          .copy-message {
            margin-top: 10px;
            font-size: 0.9rem;
          }

          .copy-message.success {
            color: #28a745;
          }

          .copy-message.error {
            color: #dc3545;
          }

          .info-card {
            text-align: left;
          }

          .info-card h3 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 1.2rem;
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
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
          }

          .info-item:last-child {
            border-bottom: none;
          }

          .info-item span {
            color: #666;
          }

          .info-item strong {
            color: #333;
          }

          .action-buttons {
            display: flex;
            gap: 15px;
          }

          .btn {
            flex: 1;
            padding: 12px 20px;
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
            color: #666;
          }

          .btn-secondary:hover {
            background: #dee2e6;
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    );
  }

  // 注册表单渲染
  return (
    <div className="register-container">
      <div className="register-content">
        <div className="register-header">
          <div className="logo">
            <div className="logo-icon">🚗</div>
            <h1>司机注册</h1>
          </div>
          <p>创建您的司机账户，开始接单服务</p>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-sections">
            {/* 基本信息 */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <h3>基本信息</h3>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="username">用户名 *</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    className={errors.username ? 'error' : ''}
                    placeholder="请输入用户名"
                  />
                  {errors.username && (
                    <span className="error-message">{errors.username}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="password">密码 *</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                    placeholder="请输入密码"
                  />
                  {errors.password && (
                    <span className="error-message">{errors.password}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="mobile">手机号 *</label>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleChange}
                    className={errors.mobile ? 'error' : ''}
                    placeholder="请输入手机号"
                  />
                  {errors.mobile && (
                    <span className="error-message">{errors.mobile}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">邮箱 *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="请输入邮箱"
                  />
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>
              </div>
            </div>

            {/* 专业信息 */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                  </svg>
                </div>
                <h3>专业信息</h3>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="licenseNo">驾照号码 *</label>
                  <input
                    id="licenseNo"
                    name="licenseNo"
                    type="text"
                    value={formData.licenseNo}
                    onChange={handleChange}
                    className={errors.licenseNo ? 'error' : ''}
                    placeholder="12位大写字母和数字"
                  />
                  {errors.licenseNo && (
                    <span className="error-message">{errors.licenseNo}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="rating">初始评分 *</label>
                  <input
                    id="rating"
                    name="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={handleChange}
                    className={errors.rating ? 'error' : ''}
                    placeholder="0.0 - 5.0"
                  />
                  {errors.rating && (
                    <span className="error-message">{errors.rating}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="cab.carType">车辆类型 *</label>
                  <input
                    id="cab.carType"
                    name="cab.carType"
                    type="text"
                    value={formData.cab.carType}
                    onChange={handleChange}
                    className={errors['cab.carType'] ? 'error' : ''}
                    placeholder="例如：经济型、舒适型、豪华型"
                  />
                  {errors['cab.carType'] && (
                    <span className="error-message">{errors['cab.carType']}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="cab.ratePerKm">每公里费率 *</label>
                  <input
                    id="cab.ratePerKm"
                    name="cab.ratePerKm"
                    type="number"
                    value={formData.cab.ratePerKm}
                    onChange={handleChange}
                    className={errors['cab.ratePerKm'] ? 'error' : ''}
                    placeholder="元/公里"
                  />
                  {errors['cab.ratePerKm'] && (
                    <span className="error-message">{errors['cab.ratePerKm']}</span>
                  )}
                </div>
              </div>
            </div>

            {/* 地址信息 */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <h3>地址信息</h3>
              </div>
              
              <div className="form-grid three-column">
                <div className="form-group">
                  <label htmlFor="address.city">城市 *</label>
                  <input
                    id="address.city"
                    name="address.city"
                    type="text"
                    value={formData.address.city}
                    onChange={handleChange}
                    className={errors['address.city'] ? 'error' : ''}
                    placeholder="城市"
                  />
                  {errors['address.city'] && (
                    <span className="error-message">{errors['address.city']}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="address.state">省份 *</label>
                  <input
                    id="address.state"
                    name="address.state"
                    type="text"
                    value={formData.address.state}
                    onChange={handleChange}
                    className={errors['address.state'] ? 'error' : ''}
                    placeholder="省份"
                  />
                  {errors['address.state'] && (
                    <span className="error-message">{errors['address.state']}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="address.pincode">邮编 *</label>
                  <input
                    id="address.pincode"
                    name="address.pincode"
                    type="text"
                    value={formData.address.pincode}
                    onChange={handleChange}
                    className={errors['address.pincode'] ? 'error' : ''}
                    placeholder="邮编"
                  />
                  {errors['address.pincode'] && (
                    <span className="error-message">{errors['address.pincode']}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="submit-error">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>{errors.submit}</span>
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  注册中...
                </>
              ) : (
                '注册司机'
              )}
            </button>
          </div>

          <div className="form-footer">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="link-btn"
            >
              已有账号？立即登录
            </button>
            <button
              type="button"
              onClick={onSwitchToCustomerRegister}
              className="link-btn secondary"
            >
              注册客户账户
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
          max-width: 900px;
        }

        .register-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 10px;
        }

        .logo-icon {
          font-size: 2.5rem;
        }

        .logo h1 {
          margin: 0;
          color: #333;
          font-size: 2.2rem;
          font-weight: 600;
        }

        .register-header p {
          margin: 0;
          color: #666;
          font-size: 1.1rem;
        }

        .form-sections {
          display: flex;
          flex-direction: column;
          gap: 30px;
          margin-bottom: 30px;
        }

        .form-section {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 25px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e9ecef;
        }

        .section-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .section-icon svg {
          width: 20px;
          height: 20px;
          color: white;
        }

        .section-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.3rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-grid.three-column {
          grid-template-columns: 1fr 1fr 1fr;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 8px;
          color: #333;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .form-group input {
          padding: 12px 15px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: white;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group input.error {
          border-color: #dc3545;
        }

        .error-message {
          color: #dc3545;
          font-size: 0.85rem;
          margin-top: 5px;
        }

        .submit-error {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .submit-error svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .form-actions {
          margin-bottom: 20px;
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          border: none;
          padding: 15px;
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

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
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
          justify-content: space-between;
          align-items: center;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }

        .link-btn {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          font-size: 0.95rem;
          transition: color 0.3s ease;
        }

        .link-btn:hover {
          color: #5a6fd8;
          text-decoration: underline;
        }

        .link-btn.secondary {
          color: #666;
        }

        .link-btn.secondary:hover {
          color: #333;
        }

        @media (max-width: 768px) {
          .register-content {
            padding: 30px 20px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-grid.three-column {
            grid-template-columns: 1fr;
          }

          .form-footer {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default DriverRegister;