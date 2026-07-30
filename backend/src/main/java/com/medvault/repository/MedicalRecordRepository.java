package com.medvault.repository;

import com.medvault.model.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<MedicalRecord> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);
}
