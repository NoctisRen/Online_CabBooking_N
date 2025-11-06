package com.masai.entity;

import javax.persistence.Entity;
import javax.persistence.PrimaryKeyJoinColumn;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@PrimaryKeyJoinColumn(name="customerId")
public class Customer extends Abstractuser {

    @NotNull(message = "旅程状态不能为空")
    private Boolean journey_status;

    // 重写父类方法添加验证
    @Override
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 255, message = "用户名长度必须在3-255字符之间")
    public String getUsername() {
        return super.getUsername();
    }

    @Override
    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 20, message = "密码长度必须在6-20字符之间")
    public String getPassword() {
        return super.getPassword();
    }

    @Override
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    public String getEmail() {
        return super.getEmail();
    }

    @Override
    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    public String getMobile() {
        return super.getMobile();
    }
}