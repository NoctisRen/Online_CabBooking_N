package com.masai.service;

import com.masai.dto.request.LoginRequest;
import com.masai.entity.CustomerDTO;

public interface UserLogIn {

    /**
     * 原有的登录方法 - 保持兼容性
     * @param userDto 用户登录数据传输对象
     * @return 登录结果信息
     * @deprecated 建议使用新的loginWithRequest方法
     */
    @Deprecated
    public String logIntoAccount(CustomerDTO userDto);

    /**
     * 新的登录方法 - 支持LoginRequest
     * @param loginRequest 登录请求对象
     * @return 登录结果信息
     */
    public String loginWithRequest(LoginRequest loginRequest);

    /**
     * 用户登出方法
     * @param key 会话密钥
     * @return 登出结果信息
     */
    public String logOutFromAccount(String key);
}