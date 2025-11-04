// 工具函数
export const formatCurrency = (amount) => {
  // 白俄罗斯卢布格式化
  if (!amount) return '0 BYN';
  return `${amount} BYN`;
};

export const formatDate = (dateString) => {
  // 日期格式化
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  } catch (error) {
    return dateString;
  }
};

// 本地存储工具
export const storage = {
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  get: (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  remove: (key) => localStorage.removeItem(key),
  clear: () => localStorage.clear(),
};