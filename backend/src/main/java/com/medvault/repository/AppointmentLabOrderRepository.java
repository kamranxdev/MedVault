package com.medvault.repository;

import com.medvault.model.AppointmentLabOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentLabOrderRepository extends JpaRepository<AppointmentLabOrder, Long> {
    List<AppointmentLabOrder> findByAppointmentIdOrderByOrderedAtDesc(Long appointmentId);
}
