package com.medvault.repository;

import com.medvault.model.PatientAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientAssignmentRepository extends JpaRepository<PatientAssignment, Long> {
    List<PatientAssignment> findByPatientIdAndEndDateIsNull(Long patientId);
    List<PatientAssignment> findByStaffUserIdAndEndDateIsNull(Long staffUserId);

    @Query("SELECT COUNT(pa) > 0 FROM PatientAssignment pa WHERE pa.patient.id = :patientId AND pa.staffUser.username = :username AND pa.endDate IS NULL")
    boolean existsActiveAssignmentByPatientIdAndUsername(@Param("patientId") Long patientId, @Param("username") String username);
}
