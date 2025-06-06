package com.MediLink.OOP2_Project_MediLink.repository;

import com.MediLink.OOP2_Project_MediLink.model.Patient;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PatientRepository extends MongoRepository<Patient, String> {

}
