// src/utils/validation.js - 完整修复版本
export const validationRules = {
  username: {
    required: '用户名不能为空',
    minLength: { value: 3, message: '用户名至少3个字符' },
    maxLength: { value: 255, message: '用户名不能超过255个字符' },
    pattern: {
      value: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
      message: '用户名只能包含字母、数字、下划线和中文字符'
    }
  },
  password: {
    required: '密码不能为空',
    minLength: { value: 6, message: '密码至少6个字符' },
    maxLength: { value: 20, message: '密码不能超过20个字符' },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/,
      message: '密码必须包含至少一个大写字母、一个小写字母和一个数字'
    }
  },
  mobile: {
    required: '手机号不能为空',
    pattern: {
      value: /^1[3-9]\d{9}$/,
      message: '手机号格式不正确'
    }
  },
  email: {
    required: '邮箱不能为空',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: '邮箱格式不正确'
    }
  },
  userId: {
    required: '用户ID不能为空',
    pattern: {
      value: /^\d+$/,
      message: '用户ID必须是数字'
    }
  },
  licenseNo: {
    required: '驾照号码不能为空',
    pattern: {
      value: /^[A-Z0-9]{12}$/,
      message: '驾照号码必须是12位大写字母和数字'
    }
  },
  rating: {
    required: '评分不能为空',
    min: { value: 0, message: '评分不能低于0.0' },
    max: { value: 5, message: '评分不能高于5.0' }
  },
  carType: {
    required: '车辆类型不能为空'
  },
  ratePerKm: {
    required: '每公里费率不能为空',
    pattern: {
      value: /^\d+$/,
      message: '费率必须是数字'
    }
  },
  // 行程相关验证规则
  fromLocation: {
    required: '出发地不能为空',
    minLength: { value: 2, message: '出发地至少2个字符' },
    maxLength: { value: 255, message: '出发地不能超过255个字符' }
  },
  toLocation: {
    required: '目的地不能为空',
    minLength: { value: 2, message: '目的地至少2个字符' },
    maxLength: { value: 255, message: '目的地不能超过255个字符' }
  },
  km: {
    required: '距离不能为空',
    pattern: {
      value: /^[1-9]\d*$/,
      message: '距离必须是正整数'
    },
    min: { value: 1, message: '距离必须大于0公里' },
    max: { value: 1000, message: '距离不能超过1000公里' }
  },
  fromDateTime: {
    required: '出发时间不能为空'
  },
  toDateTime: {
    required: '到达时间不能为空'
  }
};

// 通用的表单验证函数
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const rule = rules[field];
    
    if (!rule) {
      return;
    }
    
    // 处理必填验证
    if (rule.required) {
      if (value === null || value === undefined || value === '') {
        errors[field] = rule.required;
        return;
      }
      
      // 对于字符串类型，检查是否为空字符串
      if (typeof value === 'string' && value.trim() === '') {
        errors[field] = rule.required;
        return;
      }
    }
    
    // 如果值为空且不是必填字段，跳过后续验证
    if (value === null || value === undefined || value === '') {
      return;
    }
    
    // 将值转换为字符串进行验证
    const stringValue = String(value).trim();
    
    if (rule.minLength && stringValue.length < rule.minLength.value) {
      errors[field] = rule.minLength.message;
    } else if (rule.maxLength && stringValue.length > rule.maxLength.value) {
      errors[field] = rule.maxLength.message;
    } else if (rule.pattern && !rule.pattern.value.test(stringValue)) {
      errors[field] = rule.pattern.message;
    }
    
    // 数字验证
    if (rule.min !== undefined || rule.max !== undefined) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        if (rule.min !== undefined && numValue < rule.min) {
          errors[field] = rule.min.message;
        } else if (rule.max !== undefined && numValue > rule.max) {
          errors[field] = rule.max.message;
        }
      }
    }
  });
  
  return errors;
};

// 简单的嵌套字段验证辅助函数
export const validateNestedFields = (data, nestedRules) => {
  const errors = {};
  
  Object.keys(nestedRules).forEach(fieldPath => {
    const rule = nestedRules[fieldPath];
    const fieldNames = fieldPath.split('.');
    let value = data;
    
    // 遍历嵌套路径获取值
    for (const fieldName of fieldNames) {
      if (value && typeof value === 'object' && fieldName in value) {
        value = value[fieldName];
      } else {
        value = undefined;
        break;
      }
    }
    
    // 验证该值
    if (rule.required) {
      if (value === null || value === undefined || value === '') {
        errors[fieldPath] = rule.required;
      } else if (typeof value === 'string' && value.trim() === '') {
        errors[fieldPath] = rule.required;
      }
    }
  });
  
  return errors;
};

// 行程表单验证函数
// 在 validation.js 的 validateTripForm 函数中增强验证
export const validateTripForm = (formData) => {
  const errors = {};
  
  // 验证出发地 - 更严格的验证
  if (!formData.fromLocation?.trim()) {
    errors.fromLocation = '出发地不能为空';
  } else if (formData.fromLocation.trim().length < 2) {
    errors.fromLocation = '出发地至少2个字符';
  } else if (formData.fromLocation.trim().length > 255) {
    errors.fromLocation = '出发地不能超过255个字符';
  }
  
  // 验证目的地 - 更严格的验证
  if (!formData.toLocation?.trim()) {
    errors.toLocation = '目的地不能为空';
  } else if (formData.toLocation.trim().length < 2) {
    errors.toLocation = '目的地至少2个字符';
  } else if (formData.toLocation.trim().length > 255) {
    errors.toLocation = '目的地不能超过255个字符';
  }
  
  // 验证距离 - 更严格的验证
  if (!formData.km) {
    errors.km = '距离不能为空';
  } else {
    const km = parseInt(formData.km);
    if (isNaN(km) || km <= 0) {
      errors.km = '距离必须是正整数';
    } else if (km > 1000) {
      errors.km = '距离不能超过1000公里';
    }
  }
  
  // 验证日期 - 确保日期不为空且有效
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 出发时间验证
  if (!formData.fromDateTime) {
    errors.fromDateTime = '出发时间不能为空';
  } else {
    const fromDate = new Date(formData.fromDateTime);
    if (fromDate < today) {
      errors.fromDateTime = '出发时间不能是过去的时间';
    }
  }
  
  // 到达时间验证
  if (!formData.toDateTime) {
    errors.toDateTime = '到达时间不能为空';
  } else {
    const toDate = new Date(formData.toDateTime);
    if (toDate < today) {
      errors.toDateTime = '到达时间不能是过去的时间';
    }
  }
  
  // 验证时间逻辑
  if (formData.fromDateTime && formData.toDateTime && !errors.fromDateTime && !errors.toDateTime) {
    const fromDate = new Date(formData.fromDateTime);
    const toDate = new Date(formData.toDateTime);
    
    if (fromDate > toDate) {
      errors.toDateTime = '到达时间不能早于出发时间';
    }
  }
  
  return errors;
};