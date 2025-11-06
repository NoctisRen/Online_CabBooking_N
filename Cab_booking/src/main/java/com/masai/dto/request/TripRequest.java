package com.masai.dto.request;

import java.time.LocalDate;

import javax.validation.constraints.FutureOrPresent;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import javax.validation.constraints.Size;

import lombok.Data;

@Data
public class TripRequest {

    @NotNull(message = "客户ID不能为空")
    @Positive(message = "客户ID必须是正数")
    private Integer customerId;

    @NotBlank(message = "出发地不能为空")
    @Size(max = 255, message = "出发地长度不能超过255字符")
    private String fromLocation;

    @NotBlank(message = "目的地不能为空")
    @Size(max = 255, message = "目的地长度不能超过255字符")
    private String toLocation;

    @NotNull(message = "出发时间不能为空")
    @FutureOrPresent(message = "出发时间必须是当前或将来的时间")
    private LocalDate fromDateTime;

    @NotNull(message = "到达时间不能为空")
    @FutureOrPresent(message = "到达时间必须是当前或将来的时间")
    private LocalDate toDateTime;

    @NotNull(message = "距离不能为空")
    @Positive(message = "距离必须是正数")
    private Integer km;

    @NotNull(message = "支付状态不能为空")
    private Boolean payment;
}