package com.medvault.repository;

import com.medvault.model.Allergy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllergyRepository extends JpaRepository<Allergy, Long> {
    List<Allergy> findByPatientIdOrderByRecordedAtDesc(Long patientId);
    List<Allergy> findByPatientIdAndStatus(Long patientId, String status);
}
