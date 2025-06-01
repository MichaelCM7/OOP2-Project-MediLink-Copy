package com.MediLink.OOP2_Project_MediLink.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "hospital")
public class Hospital {
    @Id
    private String hospitalId;
    private String hospitalName;
    private String hospitalAddress;
    private String departments;
    private String email;
    private String phoneNo;
    private String password;

    public Hospital() {}

    public Hospital(String hospitalName, String hospitalAddress, String departments,
                    String email, String phoneNo, String password) {
        this.hospitalName = hospitalName;
        this.hospitalAddress = hospitalAddress;
        this.departments = departments;
        this.email = email;
        this.phoneNo = phoneNo;
        this.password = password;
    }

    // Getters and setters.
    public String getHospitalId() {
        return hospitalId;
    }

    public void setHospitalId(String hospitalId) {
        this.hospitalId = hospitalId;
    }

    public String getHospitalName() {
        return hospitalName;
    }

    public void setHospitalName(String hospitalName) {
        this.hospitalName = hospitalName;
    }

    public String getHospitalAddress() {
        return hospitalAddress;
    }

    public void setHospitalAddress(String hospitalAddress) {
        this.hospitalAddress = hospitalAddress;
    }

    public String getDepartments() {
        return departments;
    }

    public void setDepartments(String departments) {
        this.departments = departments;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNo() {
        return phoneNo;
    }

    public void setPhoneNo(String phoneNo) {
        this.phoneNo = phoneNo;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}