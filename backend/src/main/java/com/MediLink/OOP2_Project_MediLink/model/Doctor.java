package com.MediLink.OOP2_Project_MediLink.model;

import jakarta.persistence.*;

@Entity
@Table(name = "doctor")
public class Doctor extends User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int doctorId;

    @Column(nullable = false)
    private String specialisation;

    @Column(nullable = false)
    private String hospitalName;

    public Doctor() {}

    public Doctor(String firstName, String lastName, String email, String phone, String password,
                  String specialisation, String hospitalName) {
        super(firstName, lastName, email, phone, password, null);
        this.specialisation = specialisation;
        this.hospitalName = hospitalName;
    }

    public void setSpecialisation(String specialisation) {
        this.specialisation = specialisation;
    }

    public String getSpecialisation() {
        return specialisation;
    }

    public void setHospitalName(String hospitalName) {
        this.hospitalName = hospitalName;
    }

    public String getHospitalName() {
        return hospitalName;
    }
}

