package com.MediLink.OOP2_Project_MediLink.repository;

import com.MediLink.OOP2_Project_MediLink.model.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HospitalRepository extends JpaRepository<Hospital, String> {

}
