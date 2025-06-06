package com.MediLink.OOP2_Project_MediLink.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "patient")
public class Patient extends User {
    @Id
    private String patientId;

    public Patient() {}

    public Patient(String firstName, String lastName, String email, String phone, String password) {
        super(firstName, lastName, email, phone, password, null);
    }

    public String getPatientId() {
        return patientId;
    }
}