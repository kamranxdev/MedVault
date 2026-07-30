package com.medvault.repository;

import com.medvault.model.Encounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EncounterRepository extends JpaRepository<Encounter, Long> {
    List<Encounter> findByPatientIdOrderByEncounterDateDesc(Long patientId);
}
