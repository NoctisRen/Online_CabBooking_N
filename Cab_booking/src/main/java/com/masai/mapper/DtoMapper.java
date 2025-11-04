package com.masai.mapper;

import com.masai.dto.request.CustomerCreateRequest;
import com.masai.dto.response.CustomerResponse;
import com.masai.entity.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

@Mapper
public interface DtoMapper {
    DtoMapper INSTANCE = Mappers.getMapper(DtoMapper.class);

    @Mapping(source = "journey_status", target = "journeyStatus")
    CustomerResponse customerToResponse(Customer customer);

    Customer requestToCustomer(CustomerCreateRequest request);

    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "tripBooking", ignore = true)
    @Mapping(target = "journey_status", ignore = true)
    void updateCustomerFromRequest(CustomerCreateRequest request, @MappingTarget Customer customer);
}