package com.masai.validation;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import com.masai.dto.request.CustomerRequest;
import com.masai.entity.Address;

public class ValidationTest {

    private static Validator validator;

    @BeforeAll
    public static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    public void testValidCustomerRequest() {
        CustomerRequest request = createValidCustomerRequest();
        Set<ConstraintViolation<CustomerRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty(), "有效的请求不应该有验证错误");
    }

    @Test
    public void testInvalidEmail() {
        CustomerRequest request = createValidCustomerRequest();
        request.setEmail("invalid-email");

        Set<ConstraintViolation<CustomerRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty(), "无效邮箱应该被拒绝");

        boolean hasEmailError = violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("email"));
        assertTrue(hasEmailError, "应该包含邮箱验证错误");
    }

    @Test
    public void testShortPassword() {
        CustomerRequest request = createValidCustomerRequest();
        request.setPassword("short");

        Set<ConstraintViolation<CustomerRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty(), "过短密码应该被拒绝");
    }

    private CustomerRequest createValidCustomerRequest() {
        CustomerRequest request = new CustomerRequest();
        request.setUsername("validuser");
        request.setPassword("Valid123");
        request.setMobile("13800138000");
        request.setEmail("valid@example.com");

        Address address = new Address();
        address.setCity("北京");
        address.setState("北京市");
        address.setPincode("100000");
        request.setAddress(address);

        request.setJourney_status(false);
        return request;
    }
}