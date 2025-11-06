package com.masai.dto.response;

import com.masai.entity.Address;

import lombok.Data;

@Data
public class CustomerResponse {
    private Integer userId;
    private String username;
    private String mobile;
    private Address address;
    private String email;
    private boolean journeyStatus;
}