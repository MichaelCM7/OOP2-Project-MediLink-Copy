package com.MediLink.OOP2_Project_MediLink.repository;

import com.MediLink.OOP2_Project_MediLink.model.Rating;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RatingRepository extends MongoRepository<Rating, String> {

}
