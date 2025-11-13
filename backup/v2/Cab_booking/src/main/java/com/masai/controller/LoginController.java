package com.masai.controller;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.masai.dto.request.LoginRequest;
import com.masai.service.UserLogInImpl;

@RestController
public class LoginController {

    @Autowired
    private UserLogInImpl userLogIn;

    // 用户登录 - 直接使用新的LoginRequest
    @PostMapping(value = "/login")
    public String logInCustomer(@Valid @RequestBody LoginRequest loginRequest) {
        return userLogIn.loginWithRequest(loginRequest);
    }

    // 用户登出
    @PatchMapping(value = "/logout")
    public String logOutCustomer(@RequestParam(required = false) String key) {
        return userLogIn.logOutFromAccount(key);
    }
}