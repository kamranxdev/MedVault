package com.medvault.repository;

import com.medvault.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientIdOrderByPrescribedAtDesc(Long patientId);
    List<Prescription> findByDoctorIdOrderByPrescribedAtDesc(Long doctorId);
    List<Prescription> findByPatientIdAndStatus(Long patientId, String status);
}
