package com.medvault.repository;

import com.medvault.model.Diagnosis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiagnosisRepository extends JpaRepository<Diagnosis, Long> {
    List<Diagnosis> findByPatientIdOrderByRecordedAtDesc(Long patientId);
    List<Diagnosis> findByPatientIdAndStatus(Long patientId, String status);
}
