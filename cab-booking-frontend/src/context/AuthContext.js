// src/context/AuthContext.js - 更新版本
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内使用');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'customer' 或 'driver'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储的登录状态
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    const storedUserType = localStorage.getItem('userType');
    
    if (token && userData) {
      try {
        setCurrentUser(JSON.parse(userData));
        setUserType(storedUserType || 'customer');
      } catch (error) {
        console.error('解析用户数据失败:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userType');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, sessionInfo, type = 'customer') => {
    console.log('登录处理:', { userData, sessionInfo, type });
    
    // 解析session信息获取userId、uuid和userType
    const userIdMatch = sessionInfo.match(/userId=(\d+)/);
    const uuidMatch = sessionInfo.match(/uuid=([^,]+)/);
    const userTypeMatch = sessionInfo.match(/userType=([^,}]+)/);
    
    console.log('解析结果:', { userIdMatch, uuidMatch, userTypeMatch });
    
    if (userIdMatch && uuidMatch) {
      const user = {
        ...userData,
        userId: parseInt(userIdMatch[1]),
        sessionKey: uuidMatch[1],
        username: userData.username || `用户${userIdMatch[1]}`
      };
      
      // 优先使用显式传递的type，其次从sessionInfo解析，最后默认customer
      const detectedUserType = type || (userTypeMatch ? userTypeMatch[1] : 'customer');
      
      console.log('设置用户:', { user, detectedUserType });
      
      setCurrentUser(user);
      setUserType(detectedUserType);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', uuidMatch[1]);
      localStorage.setItem('userType', detectedUserType);
    } else {
      console.error('无法解析session信息:', sessionInfo);
    }
  };

  const logout = async () => {
    const sessionKey = currentUser?.sessionKey;
    if (sessionKey) {
      try {
        // 如果有登出API，可以在这里调用
        // await authService.logout(sessionKey);
      } catch (error) {
        console.error('登出时出错:', error);
      }
    }
    
    setCurrentUser(null);
    setUserType(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userType');
  };

  const value = {
    currentUser,
    userType,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};