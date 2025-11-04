package com.masai.dto.response;

import com.masai.entity.Address;
import lombok.Data;

@Data
public class CustomerResponse {
    private Integer userId;
    private String username;
    private String email;
    private String mobile;
    private Address address;
    private boolean journeyStatus;
}

// dto/response/DriverResponse.java
package com.masai.dto.response;

import com.masai.entity.Cab;
import lombok.Data;

@Data
public class DriverResponse {
    private Integer userId;
    private String username;
    private String licenseNo;
    private Double rating;
    private Boolean available;
    private Cab cab;
}