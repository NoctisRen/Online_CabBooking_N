package com.masai.entity;

import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.PrimaryKeyJoinColumn;
import javax.validation.constraints.DecimalMax;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
@PrimaryKeyJoinColumn(name="driverId")
public class Driver extends Abstractuser {

    @NotBlank(message = "驾照号码不能为空")
    @Pattern(regexp = "^[A-Z0-9]{12}$", message = "驾照号码必须是12位大写字母和数字")
    @Size(min = 12, max = 12, message = "驾照号码必须是12位")
    private String licenseNo;

    @NotNull(message = "评分不能为空")
    @DecimalMin(value = "0.0", message = "评分不能低于0.0")
    @DecimalMax(value = "5.0", message = "评分不能高于5.0")
    private Double rating;

    @NotNull(message = "可用状态不能为空")
    private Boolean available;

    @NotNull(message = "车辆信息不能为空")
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "cabId")
    private Cab cab;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "driver", orphanRemoval = true)
    @JsonIgnore
    private List<TripBooking> tripBooking;

    public String getLicenseNo() {
        return licenseNo;
    }

    public void setLicenseNo(String licenseNo) {
        this.licenseNo = licenseNo;
    }
}