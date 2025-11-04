package com.masai.dto.request;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class LoginRequest {
    @NotNull(message = "用户ID不能为空")
    private Integer userId;

    @NotBlank(message = "密码不能为空")
    private String password;
}