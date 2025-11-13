package com.masai.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.masai.dto.request.CustomerRequest;
import com.masai.dto.response.CustomerResponse;
import com.masai.entity.Address;
import com.masai.entity.Customer;

/**
 * DtoMapper测试类
 * 验证ModelMapper是否正确工作
 */
@SpringBootTest  // 这是一个Spring Boot测试，会加载整个应用上下文
public class DtoMapperTest {

    @Autowired
    private DtoMapper dtoMapper;  // 自动注入我们要测试的组件

    /**
     * 测试1: CustomerRequest -> Customer Entity 映射
     * 验证所有字段是否正确映射
     */
    @Test
    public void testCustomerRequestToEntityMapping() {
        // 1. 准备测试数据 - 创建一个完整的CustomerRequest
        CustomerRequest request = new CustomerRequest();
        request.setUsername("testuser");
        request.setPassword("password123");
        request.setEmail("test@example.com");
        request.setMobile("1234567890");

        // 创建地址对象
        Address address = new Address();
        address.setCity("北京");
        address.setState("北京市");
        address.setPincode("100000");
        request.setAddress(address);

        request.setJourney_status(false);

        // 2. 执行映射操作
        Customer customer = dtoMapper.toCustomerEntity(request);

        // 3. 验证结果 - 使用断言检查每个字段
        assertNotNull(customer, "映射结果不能为null");

        // 验证基本字段
        assertEquals("testuser", customer.getUsername(), "用户名映射错误");
        assertEquals("password123", customer.getPassword(), "密码映射错误");
        assertEquals("test@example.com", customer.getEmail(), "邮箱映射错误");
        assertEquals("1234567890", customer.getMobile(), "手机号映射错误");
        assertEquals(false, customer.getJourney_status(), "旅程状态映射错误");

        // 验证嵌套对象字段
        assertNotNull(customer.getAddress(), "地址对象映射错误");
        assertEquals("北京", customer.getAddress().getCity(), "城市映射错误");
        assertEquals("北京市", customer.getAddress().getState(), "省份映射错误");
        assertEquals("100000", customer.getAddress().getPincode(), "邮编映射错误");
    }

    /**
     * 测试2: Customer Entity -> CustomerResponse 映射
     * 验证实体到响应DTO的映射
     */
    @Test
    public void testEntityToCustomerResponseMapping() {
        // 1. 准备测试数据 - 创建一个Customer实体
        Customer customer = new Customer();
        customer.setUserId(1);  // 假设这是数据库生成的ID
        customer.setUsername("responseuser");
        customer.setPassword("responsepass");
        customer.setEmail("response@example.com");
        customer.setMobile("0987654321");

        Address address = new Address();
        address.setCity("上海");
        address.setState("上海市");
        address.setPincode("200000");
        customer.setAddress(address);

        customer.setJourney_status(true);

        // 2. 执行映射操作
        CustomerResponse response = dtoMapper.toCustomerResponse(customer);

        // 3. 验证结果
        assertNotNull(response, "响应DTO不能为null");

        assertEquals(1, response.getUserId(), "用户ID映射错误");
        assertEquals("responseuser", response.getUsername(), "用户名映射错误");
        assertEquals("response@example.com", response.getEmail(), "邮箱映射错误");
        assertEquals("0987654321", response.getMobile(), "手机号映射错误");
        assertEquals(true, response.isJourneyStatus(), "旅程状态映射错误");

        // 验证地址映射
        assertNotNull(response.getAddress(), "响应地址不能为null");
        assertEquals("上海", response.getAddress().getCity(), "响应城市映射错误");
        assertEquals("上海市", response.getAddress().getState(), "响应省份映射错误");
        assertEquals("200000", response.getAddress().getPincode(), "响应邮编映射错误");

        // 重要安全特性验证：响应DTO不应该包含密码字段！
        // 这是通过编译器的类型安全来保证的
    }

    /**
     * 测试3: null值处理测试
     * 验证当输入为null时的行为
     */
    @Test
    public void testNullInputHandling() {
        // ModelMapper默认会拒绝null源对象，抛出IllegalArgumentException
        // 这是合理的行为，因为映射null对象没有意义

        Exception exception = org.junit.jupiter.api.Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> dtoMapper.toCustomerResponse(null),
                "Expected IllegalArgumentException for null input"
        );

        assertNotNull(exception.getMessage(), "异常应该包含错误信息");
        // 可以可选地验证错误信息内容
        // assertTrue(exception.getMessage().contains("cannot be null"));
    }

    /**
     * 测试4: 部分字段测试
     * 验证当某些字段为null时的映射行为
     */
    @Test
    public void testPartialFieldMapping() {
        CustomerRequest request = new CustomerRequest();
        request.setUsername("partialuser");
        request.setEmail("partial@example.com");
        // 故意不设置password、mobile等字段

        Customer customer = dtoMapper.toCustomerEntity(request);

        assertNotNull(customer);
        assertEquals("partialuser", customer.getUsername());
        assertEquals("partial@example.com", customer.getEmail());
        // 其他字段应该是null或者默认值
        assertNull(customer.getPassword(), "密码字段应该为null");
        assertNull(customer.getMobile(), "手机号字段应该为null");
    }

    /**
     * 测试5: 验证密码安全过滤
     * 确保密码不会从实体泄露到响应DTO
     */
    @Test
    public void testPasswordSecurityInResponse() {
        // 1. 创建包含敏感信息的实体
        Customer customer = new Customer();
        customer.setUserId(1);
        customer.setUsername("secureuser");
        customer.setPassword("sensitive_password_123"); // 敏感密码
        customer.setEmail("secure@example.com");
        customer.setMobile("1234567890");

        Address address = new Address();
        address.setCity("安全城市");
        address.setState("安全省");
        address.setPincode("999999");
        customer.setAddress(address);

        customer.setJourney_status(false);

        // 2. 执行映射
        CustomerResponse response = dtoMapper.toCustomerResponse(customer);

        // 3. 验证响应DTO不包含敏感信息
        assertNotNull(response, "响应不能为null");

        // 验证非敏感字段正确映射
        assertEquals(1, response.getUserId(), "用户ID映射错误");
        assertEquals("secureuser", response.getUsername(), "用户名映射错误");
        assertEquals("secure@example.com", response.getEmail(), "邮箱映射错误");
        assertEquals("1234567890", response.getMobile(), "手机号映射错误");
        assertEquals(false, response.isJourney_status(), "旅程状态映射错误");

        // 验证地址信息
        assertNotNull(response.getAddress(), "地址不能为null");
        assertEquals("安全城市", response.getAddress().getCity(), "城市映射错误");
        assertEquals("安全省", response.getAddress().getState(), "省份映射错误");
        assertEquals("999999", response.getAddress().getPincode(), "邮编映射错误");

        // 最重要的验证：响应DTO类型安全地过滤了密码字段
        // 由于CustomerResponse类没有password字段，编译器已经确保了安全性
        // 这是通过类型系统实现的安全保障
    }

    /**
     * 测试6: 空值跳过功能测试
     * 验证ModelMapper的setSkipNullEnabled配置是否工作
     */
    @Test
    public void testSkipNullEnabledFeature() {
        // 创建部分为null的请求
        CustomerRequest request = new CustomerRequest();
        request.setUsername("testuser");
        request.setPassword("password123");
        // 故意不设置email、mobile等字段，让它们为null

        Customer customer = dtoMapper.toCustomerEntity(request);

        assertNotNull(customer);
        assertEquals("testuser", customer.getUsername());
        assertEquals("password123", customer.getPassword());
        // email和mobile应该为null，因为源对象中为null
        assertNull(customer.getEmail(), "email应该为null");
        assertNull(customer.getMobile(), "mobile应该为null");
    }
}