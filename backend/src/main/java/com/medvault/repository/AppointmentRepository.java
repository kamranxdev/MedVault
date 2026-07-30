package com.medvault.repository;

import com.medvault.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientIdOrderByAppointmentDateDesc(Long patientId);
    List<Appointment> findByDoctorIdOrderByAppointmentDateDesc(Long doctorId);
}
