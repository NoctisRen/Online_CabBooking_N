package com.masai.dto.response;

import java.time.LocalDate;

import lombok.Data;

@Data
public class TripResponse {
    private Integer tripBookingId;
    private Integer customerId;
    private String fromLocation;
    private String toLocation;
    private LocalDate fromdateTime;
    private LocalDate todateTime;
    private Integer km;
    private Integer totalAmount;
    private Boolean payment;
}