package com.MediLink.OOP2_Project_MediLink.model;

import jakarta.persistence.*;

@Entity
@Table(name = "admin")
public class Admin extends User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int adminId;

    public Admin() {}

    public Admin(String firstName, String lastName, String email, String phone, String password) {
        super(firstName, lastName, email, phone, password, null);
    }
}