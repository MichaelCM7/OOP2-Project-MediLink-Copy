package com.MediLink.OOP2_Project_MediLink.model;

import jakarta.persistence.*;

@Entity
@Table(name = "patient")
public class Patient extends User{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int patientId;

    public Patient() {}

    public Patient(String firstName, String lastName, String email, String phone, String password) {
        super(firstName, lastName, email, phone, password, null);
    }
}
