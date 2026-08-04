package com.medvault.repository;

import com.medvault.model.AppointmentBilling;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppointmentBillingRepository extends JpaRepository<AppointmentBilling, Long> {
    Optional<AppointmentBilling> findByAppointmentId(Long appointmentId);
}
