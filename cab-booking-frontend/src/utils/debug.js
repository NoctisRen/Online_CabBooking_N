// 调试工具
export const debugAPI = {
  // 测试API连接
  testConnection: async () => {
    try {
      const response = await fetch('http://localhost:8989/actuator/health');
      return {
        connected: true,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  },

  // 测试注册端点
  testRegistrationEndpoint: async (testData) => {
    try {
      const response = await fetch('http://localhost:8989/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: await response.text()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};