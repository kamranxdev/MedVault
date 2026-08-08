package com.medvault.security;

import com.medvault.model.Patient;
import com.medvault.model.User;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service("patientSecurityService")
public class PatientSecurityService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final AbacSecurityEvaluator abacEvaluator;

    public PatientSecurityService(UserRepository userRepository,
                                  PatientRepository patientRepository,
                                  AbacSecurityEvaluator abacEvaluator) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.abacEvaluator = abacEvaluator;
    }

    public boolean canAccessPatient(Authentication authentication, Long patientId) {
        if (authentication == null || !authentication.isAuthenticated() || patientId == null) {
            return false;
        }

        Set<String> authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        // Platform / Facility Admins, Auditors, Receptionists, and Clinicians have demographic/record read permissions
        if (authorities.contains("ROLE_SYS_ADMIN") || authorities.contains("ROLE_ORG_ADMIN") ||
            authorities.contains("ROLE_ADMIN") || authorities.contains("ROLE_DOCTOR") ||
            authorities.contains("ROLE_NURSE") || authorities.contains("ROLE_RECEPTIONIST") ||
            authorities.contains("ROLE_LAB_TECH") || authorities.contains("ROLE_PHARMACIST") ||
            authorities.contains("ROLE_BILLING") || authorities.contains("ROLE_AUDITOR") ||
            authorities.contains("PATIENT_READ")) {
            
            // Further ABAC treatment relationship check for non-admin roles
            return abacEvaluator.hasTreatmentRelationship(authentication, patientId);
        }

        // Patient role can only access their own linked patient record
        if (authorities.contains("ROLE_PATIENT")) {
            Optional<User> userOpt = userRepository.findByUsername(authentication.getName());
            if (userOpt.isPresent()) {
                Optional<Patient> patientOpt = patientRepository.findByUserId(userOpt.get().getId());
                return patientOpt.isPresent() && patientOpt.get().getId().equals(patientId);
            }
        }

        return false;
    }

    public boolean canAccessUser(Authentication authentication, Long userId) {
        if (authentication == null || !authentication.isAuthenticated() || userId == null) {
            return false;
        }

        Set<String> authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        if (authorities.contains("ROLE_SYS_ADMIN") || authorities.contains("ROLE_ORG_ADMIN") ||
            authorities.contains("ROLE_ADMIN") || authorities.contains("ROLE_DOCTOR") ||
            authorities.contains("ROLE_NURSE") || authorities.contains("ROLE_RECEPTIONIST") ||
            authorities.contains("ROLE_AUDITOR")) {
            return true;
        }

        if (authorities.contains("ROLE_PATIENT")) {
            Optional<User> userOpt = userRepository.findByUsername(authentication.getName());
            return userOpt.isPresent() && userOpt.get().getId().equals(userId);
        }

        return false;
    }
}
