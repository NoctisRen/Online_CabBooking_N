package com.masai.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.masai.entity.CurrentUserSession;
import com.masai.entity.Customer;
import com.masai.entity.CustomerDTO;
import com.masai.entity.Driver;
import com.masai.entity.Admin;

import com.masai.exception.AdminExceptions;
import com.masai.exception.InvalidPasswordException;
import com.masai.exception.NotFoundException;
import com.masai.repository.AdminDao;
import com.masai.repository.CustomerDao;
import com.masai.repository.DriverDao;
import com.masai.repository.SessionDao;

import net.bytebuddy.utility.RandomString;

@Service
@Transactional
public class UserLogInImpl implements UserLogIn {

    @Autowired
    private AdminDao adminDao;

    @Autowired
    private DriverDao driverDao;

    @Autowired
    private CustomerDao customerDao;

    @Autowired
    private SessionDao sessionDao;

    @Override
    @Transactional
    public String logIntoAccount(CustomerDTO userDto) {
        Integer userId = userDto.getUserId();

        System.out.println("=== LOGIN ATTEMPT ===");
        System.out.println("User ID: " + userId);

        // 1. 首先强制删除任何现有的会话
        try {
            Optional<CurrentUserSession> existingSession = sessionDao.findById(userId);
            if (existingSession.isPresent()) {
                System.out.println("Found existing session, deleting...");
                sessionDao.delete(existingSession.get());
                sessionDao.flush(); // 强制立即提交删除操作
                System.out.println("Existing session deleted");
            }
        } catch (Exception e) {
            System.out.println("Error deleting existing session: " + e.getMessage());
            // 继续尝试登录，不因为删除失败而阻止登录
        }

        // 2. 验证用户存在性和密码
        String username = null;
        boolean passwordValid = false;

        // 检查客户
        Optional<Customer> customer = customerDao.findById(userId);
        if (customer.isPresent()) {
            if (customer.get().getPassword().equals(userDto.getPassword())) {
                passwordValid = true;
                username = customer.get().getUsername();
                System.out.println("Customer login validated: " + username);
            }
        }
        // 检查司机
        else {
            Optional<Driver> driver = driverDao.findById(userId);
            if (driver.isPresent()) {
                if (driver.get().getPassword().equals(userDto.getPassword())) {
                    passwordValid = true;
                    username = driver.get().getUsername();
                    System.out.println("Driver login validated: " + username);
                }
            }
            // 检查管理员
            else {
                Optional<Admin> admin = adminDao.findById(userId);
                if (admin.isPresent()) {
                    if (admin.get().getPassword().equals(userDto.getPassword())) {
                        passwordValid = true;
                        username = admin.get().getUsername();
                        System.out.println("Admin login validated: " + username);
                    }
                }
            }
        }

        if (!passwordValid) {
            throw new InvalidPasswordException("Invalid password for user ID: " + userId);
        }

        // 3. 创建新会话
        try {
            String key = RandomString.make(6);
            CurrentUserSession newSession = new CurrentUserSession(userId, key, LocalDateTime.now());

            System.out.println("Creating new session: " + key);
            CurrentUserSession savedSession = sessionDao.save(newSession);
            System.out.println("Session created successfully: " + savedSession.getId());

            return String.format("Login successful. UserId: %d, Username: %s, SessionKey: %s",
                    userId, username, key);

        } catch (Exception e) {
            System.out.println("Error creating session: " + e.getMessage());
            throw new AdminExceptions("Unable to create session: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public String logOutFromAccount(String key) {
        Optional<CurrentUserSession> session = sessionDao.findByUuid(key);

        if (!session.isPresent()) {
            throw new NotFoundException("No active session found with key: " + key);
        }

        sessionDao.delete(session.get());
        return String.format("User %d logged out successfully.", session.get().getUserId());
    }

    // 强制登出方法
    @Transactional
    public String forceLogout(Integer userId) {
        try {
            Optional<CurrentUserSession> session = sessionDao.findById(userId);
            if (session.isPresent()) {
                sessionDao.delete(session.get());
                sessionDao.flush();
                return String.format("User %d forcefully logged out.", userId);
            }
            return String.format("No active session for user %d.", userId);
        } catch (Exception e) {
            throw new AdminExceptions("Error during force logout: " + e.getMessage());
        }
    }
}