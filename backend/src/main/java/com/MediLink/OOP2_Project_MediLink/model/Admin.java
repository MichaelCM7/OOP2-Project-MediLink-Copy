package com.MediLink.OOP2_Project_MediLink.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "admin")
public class Admin extends User {
    @Id
    private String adminId;

    public Admin() {}

    public Admin(String firstName, String lastName, String email, String phone, String password,String description) {
        super(firstName, lastName, email, phone, password, description);
    }

    public String getAdminId() {
        return adminId;
    }
}