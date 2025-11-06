package com.masai.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.masai.dto.request.CustomerRequest;
import com.masai.dto.response.CustomerResponse;
import com.masai.entity.Customer;

@Component
public class DtoMapper {

    @Autowired
    private ModelMapper modelMapper;

    public Customer toCustomerEntity(CustomerRequest request) {
        return modelMapper.map(request, Customer.class);
    }

    public CustomerResponse toCustomerResponse(Customer customer) {
        return modelMapper.map(customer, CustomerResponse.class);
    }

    public List<CustomerResponse> toCustomerResponseList(List<Customer> customers) {
        return customers.stream()
                .map(this::toCustomerResponse)
                .collect(Collectors.toList());
    }

    public CustomerRequest toCustomerRequest(Customer customer) {
        return modelMapper.map(customer, CustomerRequest.class);
    }
}