package com.medvault.repository;

import com.medvault.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByPatientCode(String patientCode);
    Optional<Patient> findByUserId(Long userId);

    @Query("SELECT p FROM Patient p WHERE " +
           "LOWER(p.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.patientCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.ssn) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.phone) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Patient> searchPatients(@Param("query") String query);
}
