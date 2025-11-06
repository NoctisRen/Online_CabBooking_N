package com.masai.controller;

import java.util.List;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.masai.dto.request.CustomerRequest;
import com.masai.dto.response.CustomerResponse;
import com.masai.entity.Customer;
import com.masai.mapper.DtoMapper;
import com.masai.service.CustomerService;

@RestController
public class CustomerController {

    @Autowired
    private CustomerService service;

    @Autowired
    private DtoMapper dtoMapper;

    @GetMapping("/customer/{id}")
    public CustomerResponse getCustomer(@PathVariable("id") Integer id) {
        Customer customer = service.findCustomer(id);
        return dtoMapper.toCustomerResponse(customer);
    }

    @GetMapping("/customers")
    public List<CustomerResponse> getAllCustomer() {
        List<Customer> customers = service.allCustomer();
        return dtoMapper.toCustomerResponseList(customers);
    }

    @GetMapping("/customer/{email}/{password}")
    public CustomerResponse getCustomerByCredentials(
            @PathVariable("email") String email,
            @PathVariable("password") String password) {
        Customer customer = service.vaildCustomer(email, password);
        return dtoMapper.toCustomerResponse(customer);
    }

    @PostMapping(value = "/save", consumes = "application/json")
    public CustomerResponse saveCustomer(@Valid @RequestBody CustomerRequest request) {
        System.out.println("接收到的请求: " + request);
        Customer customer = dtoMapper.toCustomerEntity(request);
        Customer savedCustomer = service.saveCustomer(customer);
        return dtoMapper.toCustomerResponse(savedCustomer);
    }

    @PutMapping("/update/{id}")
    public CustomerResponse updateCustomer(
            @Valid @RequestBody CustomerRequest request,
            @PathVariable("id") Integer id) {
        Customer customer = dtoMapper.toCustomerEntity(request);
        Customer updatedCustomer = service.updateCustomer(customer, id);
        return dtoMapper.toCustomerResponse(updatedCustomer);
    }

    @DeleteMapping("/customer/delete/{id}")
    public String deleteCustomer(@PathVariable("id") Integer id) {
        return service.deleteCustomer(id);
    }
}