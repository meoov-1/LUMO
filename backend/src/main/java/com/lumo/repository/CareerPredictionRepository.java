package com.lumo.repository;

import com.lumo.entity.CareerPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CareerPredictionRepository extends JpaRepository<CareerPrediction, Long> {
    
    Optional<CareerPrediction> findTopByUserIdOrderByGeneratedAtDesc(Long userId);
    
    Optional<CareerPrediction> findByUserIdAndCycle(Long userId, Integer cycle);
    
    List<CareerPrediction> findByUserIdOrderByGeneratedAtDesc(Long userId);
}
