package com.medvault.repository;

import com.medvault.model.AppointmentNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentNoteRepository extends JpaRepository<AppointmentNote, Long> {
    List<AppointmentNote> findByAppointmentIdOrderByCreatedAtDesc(Long appointmentId);
}
