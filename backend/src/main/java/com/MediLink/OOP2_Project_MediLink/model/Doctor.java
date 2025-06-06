package com.MediLink.OOP2_Project_MediLink.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "doctors")
public class Doctor extends User {
    @Id
    private String doctorId;
    private String specialisation;
    private String hospitalName;

    public Doctor() {}

    public Doctor(String firstName, String lastName, String email, String phone, String password,
                  String specialisation, String hospitalName) {
        super(firstName, lastName, email, phone, password, null);
        this.specialisation = specialisation;
        this.hospitalName = hospitalName;
    }

    public String getDoctorId() { return doctorId; }
    public void setSpecialisation(String specialisation) { this.specialisation = specialisation; }
    public String getSpecialisation() { return specialisation; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }
    public String getHospitalName() { return hospitalName; }
}