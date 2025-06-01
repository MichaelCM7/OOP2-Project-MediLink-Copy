package com.MediLink.OOP2_Project_MediLink.model;

import jakarta.persistence.*;

@Entity
@Table(name = "hospital")
public class Hospital {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int hospitalId;

    @Column(nullable = false)
    private String hospitalName;

    @Column(nullable = false)
    private String hospitalAddress;

    @Column(nullable = false)
    private String departments;

    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String phoneNo;

    @Column(nullable = false)
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

    public int getHospitalId() {
        return hospitalId;
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
