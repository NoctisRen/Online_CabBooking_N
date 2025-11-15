// src/App.js - 完整更新版本（包含管理员功能）
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import DriverRegister from './components/auth/DriverRegister';
import Welcome from './components/auth/Welcome';
import CustomerDashboard from './components/customer/CustomerDashboard';
import DriverDashboard from './components/driver/DriverDashboard';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';

// 认证页面包装器
const AuthPage = () => {
  const [authMode, setAuthMode] = useState('welcome'); // 'welcome', 'login', 'register', 'driverRegister'
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const renderAuthComponent = () => {
    switch (authMode) {
      case 'welcome':
        return (
          <Welcome 
            onCustomerLogin={() => setAuthMode('login')}
            onDriverLogin={() => setAuthMode('login')}
            onCustomerRegister={() => setAuthMode('register')}
            onDriverRegister={() => setAuthMode('driverRegister')}
            onAdminLogin={() => setShowAdminLogin(true)}
          />
        );
      case 'login':
        return (
          <Login 
            onSwitchToRegister={() => setAuthMode('register')}
            onSwitchToDriverRegister={() => setAuthMode('driverRegister')}
            onBackToWelcome={() => setAuthMode('welcome')}
            onAdminLogin={() => setShowAdminLogin(true)}
          />
        );
      case 'register':
        return (
          <Register 
            onSwitchToLogin={() => setAuthMode('login')}
            onSwitchToDriverRegister={() => setAuthMode('driverRegister')}
            onBackToWelcome={() => setAuthMode('welcome')}
            onAdminLogin={() => setShowAdminLogin(true)}
          />
        );
      case 'driverRegister':
        return (
          <DriverRegister 
            onSwitchToLogin={() => setAuthMode('login')}
            onSwitchToCustomerRegister={() => setAuthMode('register')}
            onBackToWelcome={() => setAuthMode('welcome')}
            onAdminLogin={() => setShowAdminLogin(true)}
          />
        );
      default:
        return <Welcome onCustomerLogin={() => setAuthMode('login')} />;
    }
  };

  return (
    <div>
      {renderAuthComponent()}
      
      {/* 管理员登录模态框 */}
      {showAdminLogin && (
        <AdminLogin
          onClose={() => setShowAdminLogin(false)}
          onSwitchToUserLogin={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  );
};

// 主布局组件
const MainLayout = () => {
  const { currentUser, userType, logout } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  const renderContent = () => {
    if (userType === 'admin') {
      return <AdminDashboard />;
    }
    
    if (userType === 'driver' && activeView === 'driverDashboard') {
      return <DriverDashboard />;
    }
    
    if (userType === 'customer' && activeView === 'customerDashboard') {
      return <CustomerDashboard />;
    }

    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            欢迎使用网约车平台
          </h2>
          <p className="text-gray-600 mb-4">
            您已成功登录，用户ID: {currentUser?.userId} 
            （{userType === 'driver' ? '司机' : userType === 'admin' ? '管理员' : '乘客'}）
          </p>
          <div className="space-y-2 text-left max-w-md mx-auto">
            <p>✅ 用户认证系统已就绪</p>
            <p>🚗 客户和司机注册功能</p>
            <p>👨‍💼 司机信息管理</p>
            <p>👤 乘客行程管理</p>
            <p>🛠️ 管理员仪表板</p>
            <div className="mt-4 space-x-4">
              {userType === 'driver' && (
                <button
                  onClick={() => setActiveView('driverDashboard')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  进入司机工作台
                </button>
              )}
              {userType === 'customer' && (
                <button
                  onClick={() => setActiveView('customerDashboard')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  进入乘客中心
                </button>
              )}
              {userType === 'admin' && (
                <button
                  onClick={() => setActiveView('adminDashboard')}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  进入管理员面板
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getNavTitle = () => {
    if (userType === 'admin') return '管理员工作台';
    if (activeView === 'driverDashboard') return '司机工作台';
    if (activeView === 'customerDashboard') return '乘客中心';
    return '网约车平台';
  };

  const getUserTypeDisplay = () => {
    switch (userType) {
      case 'admin':
        return { text: '管理员', bgColor: 'bg-red-100', textColor: 'text-red-800' };
      case 'driver':
        return { text: '司机', bgColor: 'bg-green-100', textColor: 'text-green-800' };
      default:
        return { text: '乘客', bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
    }
  };

  const userTypeDisplay = getUserTypeDisplay();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">{getNavTitle()}</h1>
              {(activeView === 'driverDashboard' || activeView === 'customerDashboard') && (
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="ml-4 text-gray-600 hover:text-gray-900 text-sm bg-gray-100 px-3 py-1 rounded-md"
                >
                  ← 返回主页
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {!currentUser && (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="text-gray-600 hover:text-gray-900 text-sm bg-gray-100 px-3 py-1 rounded-md transition-colors"
                >
                  管理员登录
                </button>
              )}
              {currentUser && (
                <>
                  <div className="text-right">
                    <span className="text-gray-700 block text-sm">
                      欢迎, {currentUser?.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      ID: {currentUser?.userId}
                    </span>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${userTypeDisplay.bgColor} ${userTypeDisplay.textColor}`}>
                    {userTypeDisplay.text}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    退出登录
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderContent()}
      </main>

      {/* 管理员登录模态框 */}
      {showAdminLogin && (
        <AdminLogin
          onClose={() => setShowAdminLogin(false)}
          onSwitchToUserLogin={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  );
};

// 应用内容组件
const AppContent = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;