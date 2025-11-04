import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// 导入页面组件
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState('');

  // 检查本地存储中的用户登录状态
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedUserType = localStorage.getItem('userType');
    
    if (savedUser && savedUserType) {
      setUser(JSON.parse(savedUser));
      setUserType(savedUserType);
    }
  }, []);

  // 处理登录
  const handleLogin = (userData, type) => {
    setUser(userData);
    setUserType(type);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('userType', type);
  };

  // 处理注销
  const handleLogout = () => {
    setUser(null);
    setUserType('');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userType');
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              user ? 
                <Navigate to={`/${userType.toLowerCase()}`} /> : 
                <LoginPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/register" 
            element={
              user ? 
                <Navigate to={`/${userType.toLowerCase()}`} /> : 
                <RegisterPage />
            } 
          />
          <Route 
            path="/customer" 
            element={
              user && userType === 'customer' ? 
                <CustomerDashboard user={user} onLogout={handleLogout} /> : 
                <Navigate to="/login" />
            } 
          />
          <Route 
            path="/driver" 
            element={
              user && userType === 'driver' ? 
                <DriverDashboard user={user} onLogout={handleLogout} /> : 
                <Navigate to="/login" />
            } 
          />
          <Route 
            path="/admin" 
            element={
              user && userType === 'admin' ? 
                <AdminDashboard user={user} onLogout={handleLogout} /> : 
                <Navigate to="/login" />
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;