package com.MediLink.OOP2_Project_MediLink.service;

import com.MediLink.OOP2_Project_MediLink.model.Admin;
import com.MediLink.OOP2_Project_MediLink.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    public Admin createAdmin(Admin admin) {
        return adminRepository.save(admin);
    }
}
