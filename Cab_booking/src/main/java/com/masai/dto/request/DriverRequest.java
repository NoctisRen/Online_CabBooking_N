package com.masai.dto.request;

import javax.validation.Valid;
import javax.validation.constraints.DecimalMax;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

import com.masai.entity.Address;
import com.masai.entity.Cab;

import lombok.Data;

@Data
public class DriverRequest {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 255, message = "用户名长度必须在3-255字符之间")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 20, message = "密码长度必须在6-20字符之间")
    private String password;

    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String mobile;

    @Valid
    @NotNull(message = "地址信息不能为空")
    private Address address;

    @NotBlank(message = "邮箱不能为空")
    @javax.validation.constraints.Email(message = "邮箱格式不正确")
    private String email;

    @NotBlank(message = "驾照号码不能为空")
    @Pattern(regexp = "^[A-Z0-9]{12}$", message = "驾照号码必须是12位大写字母和数字")
    private String licenseNo;

    @NotNull(message = "评分不能为空")
    @DecimalMin(value = "0.0", message = "评分不能低于0.0")
    @DecimalMax(value = "5.0", message = "评分不能高于5.0")
    private Double rating;

    @NotNull(message = "可用状态不能为空")
    private Boolean available;

    @Valid
    @NotNull(message = "车辆信息不能为空")
    private Cab cab;
}