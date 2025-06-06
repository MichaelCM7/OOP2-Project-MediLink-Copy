package com.MediLink.OOP2_Project_MediLink.repository;

import com.MediLink.OOP2_Project_MediLink.model.Admin;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AdminRepository extends MongoRepository<Admin, String> {
}