package com.masai.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.masai.dto.request.CustomerCreateRequest;
import com.masai.dto.request.LoginRequest;
import com.masai.dto.response.CustomerResponse;
import com.masai.entity.Customer;
import com.masai.exception.InvalidId;
import com.masai.exception.Nullexception;
import com.masai.mapper.DtoMapper;
import com.masai.repository.AddressDao;
import com.masai.repository.CustomerDao;

@Service
@Transactional
public class CustomerServiceImp implements CustomerService {

    @Autowired
    private CustomerDao cdao;

    @Autowired
    private AddressDao Adao;

    @Autowired
    private DtoMapper dtoMapper;

    @Override
    public CustomerResponse saveCustomer(CustomerCreateRequest request) {
        Customer customer = dtoMapper.requestToCustomer(request);
        Customer savedCustomer = cdao.save(customer);
        return dtoMapper.customerToResponse(savedCustomer);
    }

    @Override
    public CustomerResponse findCustomer(Integer id) throws InvalidId {
        Customer customer = cdao.findById(id)
                .orElseThrow(() -> new InvalidId("Customer with ID " + id + " does not exist"));
        return dtoMapper.customerToResponse(customer);
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomer(CustomerCreateRequest request, Integer id) throws InvalidId {
        Customer existingCustomer = cdao.findById(id)
                .orElseThrow(() -> new InvalidId("Customer with ID " + id + " does not exist"));

        // 保存旧地址ID用于清理
        Integer oldAddressId = existingCustomer.getAddress().getId();

        // 使用Mapper更新字段
        dtoMapper.updateCustomerFromRequest(request, existingCustomer);

        // 清理旧地址
        Adao.findById(oldAddressId).ifPresent(Adao::delete);

        // 保存新地址
        Customer updatedCustomer = cdao.save(existingCustomer);
        return dtoMapper.customerToResponse(updatedCustomer);
    }

    @Override
    @Transactional
    public String deleteCustomer(Integer id) throws InvalidId {
        Customer customer = cdao.findById(id)
                .orElseThrow(() -> new InvalidId("Customer with ID " + id + " does not exist"));

        // 删除关联地址
        Adao.delete(customer.getAddress());
        cdao.delete(customer);

        return "Customer with ID " + id + " has been deleted successfully";
    }

    @Override
    public List<CustomerResponse> allCustomer() throws Nullexception {
        List<Customer> customers = cdao.findAll();
        if (customers.isEmpty()) {
            throw new Nullexception("No customers available");
        }

        return customers.stream()
                .map(dtoMapper::customerToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerResponse validCustomer(LoginRequest loginRequest) throws InvalidId {
        List<Customer> customers = cdao.findAll();

        return customers.stream()
                .filter(customer ->
                        customer.getEmail().equals(loginRequest.getEmail()) &&
                                customer.getPassword().equals(loginRequest.getPassword()))
                .findFirst()
                .map(dtoMapper::customerToResponse)
                .orElseThrow(() -> new InvalidId("Invalid email or password"));
    }

    @Override
    public Customer getCustomerEntity(Integer id) throws InvalidId {
        return cdao.findById(id)
                .orElseThrow(() -> new InvalidId("Customer with ID " + id + " does not exist"));
    }
}