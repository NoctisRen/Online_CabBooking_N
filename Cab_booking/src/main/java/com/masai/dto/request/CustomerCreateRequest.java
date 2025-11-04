package com.masai.dto.request;

import com.masai.entity.Address;
import lombok.Data;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
public class CustomerCreateRequest {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 255, message = "用户名长度3-255字符")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 4, max = 20, message = "密码长度4-20字符")
    private String password;

    @Email(message = "邮箱格式不正确")
    private String email;

    private String mobile;
    private Address address;
}