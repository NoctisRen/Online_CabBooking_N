// src/App.js - 修复版本
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import TripBooking from './components/trip/TripBooking';
import TripList from './components/trip/TripList';

// 修复的导航组件 - 添加 useAuth hook
const Navigation = ({ currentPage, onPageChange, onLogout }) => {
  const { currentUser } = useAuth(); // 添加这行
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">网约车平台</h1>
            <div className="ml-10 flex items-baseline space-x-4">
              <button
                onClick={() => onPageChange('home')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'home' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                首页
              </button>
              <button
                onClick={() => onPageChange('book-trip')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'book-trip' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                预订行程
              </button>
              <button
                onClick={() => onPageChange('my-trips')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'my-trips' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                我的行程
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">欢迎, {currentUser?.username}</span>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// 主布局组件
const MainLayout = () => {
  const { currentUser, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'book-trip':
        return <TripBooking />;
      case 'my-trips':
        return <TripList />;
      case 'home':
      default:
        return (
          <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                欢迎回来，{currentUser?.username}！
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                您已成功登录网约车平台，用户ID: {currentUser?.userId}
              </p>
            </div>
            
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">🚗</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">预订行程</h3>
                      <p className="mt-1 text-sm text-gray-500">立即开始新的旅程</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => setCurrentPage('book-trip')}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      立即预订
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">📋</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">我的行程</h3>
                      <p className="mt-1 text-sm text-gray-500">查看历史行程记录</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => setCurrentPage('my-trips')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      查看行程
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">👤</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">个人信息</h3>
                      <p className="mt-1 text-sm text-gray-500">管理您的账户信息</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => alert('个人信息功能开发中...')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      查看信息
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
      />
      <main>{renderContent()}</main>
    </div>
  );
};

// 认证页面包装器
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div>
      {isLogin ? (
        <Login onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <Register onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  );
};

// 根组件
const AppContent = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return currentUser ? <MainLayout /> : <AuthPage />;
};

// 应用入口
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;