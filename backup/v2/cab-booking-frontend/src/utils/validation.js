// src/utils/validation.js - 添加行程相关验证
export const validationRules = {
  // 保持原有的用户验证规则...
  username: {
    required: '用户名不能为空',
    minLength: { value: 3, message: '用户名至少3个字符' },
    maxLength: { value: 255, message: '用户名不能超过255个字符' }
  },
  password: {
    required: '密码不能为空',
    minLength: { value: 6, message: '密码至少6个字符' },
    maxLength: { value: 20, message: '密码不能超过20个字符' }
  },
  mobile: {
    required: '手机号不能为空'
  },
  email: {
    required: '邮箱不能为空'
  },
  userId: {
    required: '用户ID不能为空',
    pattern: {
      value: /^\d+$/,
      message: '用户ID必须是数字'
    }
  },

  // 新增行程验证规则
  fromLocation: {
    required: '出发地不能为空',
    maxLength: { value: 255, message: '出发地长度不能超过255字符' }
  },
  toLocation: {
    required: '目的地不能为空',
    maxLength: { value: 255, message: '目的地长度不能超过255字符' }
  },
  fromDateTime: {
    required: '出发时间不能为空'
  },
  toDateTime: {
    required: '到达时间不能为空'
  },
  km: {
    required: '距离不能为空',
    pattern: {
      value: /^\d+$/,
      message: '距离必须是正整数'
    }
  }
};

// 保持原有的validateForm函数...
export const validateForm = (data, rules) => {
  const errors = {};
  console.log('验证数据:', data);
  console.log('验证规则:', rules);
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const rule = rules[field];
    
    if (!rule) {
      console.warn(`字段 ${field} 没有定义验证规则`);
      return;
    }
    
    console.log(`验证字段 ${field}:`, value);
    
    if (rule.required && (!value || value.trim() === '')) {
      errors[field] = rule.required;
      console.log(`字段 ${field} 验证失败: 必填`);
      return;
    }
    
    if (value && value.trim() !== '') {
      if (rule.minLength && value.length < rule.minLength.value) {
        errors[field] = rule.minLength.message;
        console.log(`字段 ${field} 验证失败: 长度不足`);
      } else if (rule.maxLength && value.length > rule.maxLength.value) {
        errors[field] = rule.maxLength.message;
        console.log(`字段 ${field} 验证失败: 长度超限`);
      } else if (rule.pattern && !rule.pattern.value.test(value)) {
        errors[field] = rule.pattern.message;
        console.log(`字段 ${field} 验证失败: 格式错误`);
      }
    }
  });
  
  console.log('最终验证错误:', errors);
  return errors;
};

// src/utils/validation.js - 更新日期验证
// ... 保持其他验证规则不变 ...

// 更新行程验证函数
export const validateTripForm = (tripData) => {
  const errors = validateForm(tripData, {
    fromLocation: validationRules.fromLocation,
    toLocation: validationRules.toLocation,
    fromDateTime: validationRules.fromDateTime,
    toDateTime: validationRules.toDateTime,
    km: validationRules.km
  });

  // 验证日期逻辑
  if (tripData.fromDateTime && tripData.toDateTime) {
    const fromDate = new Date(tripData.fromDateTime);
    const toDate = new Date(tripData.toDateTime);
    
    if (fromDate >= toDate) {
      errors.dateLogic = '到达日期必须晚于出发日期';
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (fromDate < today) {
      errors.fromDatePast = '出发日期不能是过去的日期';
    }
  }

  return errors;
};