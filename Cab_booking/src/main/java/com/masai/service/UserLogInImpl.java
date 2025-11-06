package com.masai.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.masai.dto.request.LoginRequest;
import com.masai.entity.CurrentUserSession;
import com.masai.entity.Customer;
import com.masai.entity.CustomerDTO;
import com.masai.exception.AdminExceptions;
import com.masai.exception.InvalidPasswordException;
import com.masai.exception.NotFoundException;
import com.masai.exception.UserAlreadyExistWithuserId;
import com.masai.repository.CustomerDao;
import com.masai.repository.SessionDao;

import net.bytebuddy.utility.RandomString;

@Service
public class UserLogInImpl implements UserLogIn {

    @Autowired
    private CustomerDao customerDao;

    @Autowired
    private SessionDao sessionDao;

    @Override
    public String logIntoAccount(CustomerDTO userDto) {
        return loginWithUserIdAndPassword(userDto.getUserId(), userDto.getPassword());
    }

    /**
     * 新的登录方法 - 支持LoginRequest
     * 可以直接被Controller调用
     */
    public String loginWithRequest(LoginRequest loginRequest) {
        return loginWithUserIdAndPassword(loginRequest.getUserId(), loginRequest.getPassword());
    }

    /**
     * 统一的登录逻辑处理
     */
    private String loginWithUserIdAndPassword(Integer userId, String password) {
        Optional<Customer> opt_customer = customerDao.findById(userId);

        // 检查用户是否存在
        if (!opt_customer.isPresent()) {
            throw new AdminExceptions("用户不存在");
        }

        Customer customer = opt_customer.get();

        // 检查是否已经登录
        Optional<CurrentUserSession> currentUserOptional = sessionDao.findById(userId);
        if (currentUserOptional.isPresent()) {
            throw new UserAlreadyExistWithuserId("该用户已登录");
        }

        // 验证密码
        if (customer.getPassword().equals(password)) {
            String key = RandomString.make(6);
            CurrentUserSession currentUserSession = new CurrentUserSession(
                    customer.getUserId(),
                    key,
                    LocalDateTime.now()
            );
            sessionDao.save(currentUserSession);

            return currentUserSession.toString();
        } else {
            throw new InvalidPasswordException("密码错误");
        }
    }

    @Override
    public String logOutFromAccount(String key) {
        Optional<CurrentUserSession> currentUserOptional = sessionDao.findByUuid(key);

        if (!currentUserOptional.isPresent()) {
            throw new NotFoundException("用户未登录");
        }

        CurrentUserSession currentUserSession = currentUserOptional.get();
        sessionDao.delete(currentUserSession);

        return "登出成功";
    }
}