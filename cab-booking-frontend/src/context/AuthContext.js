// src/context/AuthContext.js
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储的登录状态
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    
    if (token && userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, sessionInfo) => {
    // 解析session信息获取userId和uuid
    // sessionInfo格式: CurrentUserSession(id=1, userId=123, uuid=abc123, localDateTime=...)
    const userIdMatch = sessionInfo.match(/userId=(\d+)/);
    const uuidMatch = sessionInfo.match(/uuid=([^,]+)/);
    
    if (userIdMatch && uuidMatch) {
      const user = {
        ...userData,
        userId: parseInt(userIdMatch[1]),
        sessionKey: uuidMatch[1]
      };
      
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', uuidMatch[1]);
    }
  };

  const logout = async () => {
    const sessionKey = currentUser?.sessionKey;
    if (sessionKey) {
      try {
        await authService.logout(sessionKey);
      } catch (error) {
        console.error('登出时出错:', error);
      }
    }
    
    setCurrentUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  };

  const value = {
    currentUser,
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