package com.MediLink.OOP2_Project_MediLink.repository;

import com.MediLink.OOP2_Project_MediLink.model.Hospital;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface HospitalRepository extends MongoRepository<Hospital, String> {

}
