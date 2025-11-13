package com.masai.service;

import java.util.List;
import com.masai.dto.request.CustomerCreateRequest;
import com.masai.dto.request.LoginRequest;
import com.masai.dto.response.CustomerResponse;
import com.masai.exception.InvalidId;
import com.masai.exception.Nullexception;

public interface CustomerService {
    public CustomerResponse saveCustomer(CustomerCreateRequest request);
    public CustomerResponse findCustomer(Integer id) throws InvalidId;
    public CustomerResponse updateCustomer(CustomerCreateRequest request, Integer id) throws InvalidId;
    public String deleteCustomer(Integer id) throws InvalidId;
    public List<CustomerResponse> allCustomer() throws Nullexception;
    public CustomerResponse validCustomer(LoginRequest loginRequest) throws InvalidId;
    // 保留内部使用的Entity方法（可选）
    public com.masai.entity.Customer getCustomerEntity(Integer id) throws InvalidId;
}