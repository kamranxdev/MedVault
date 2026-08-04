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

    public PatientSecurityService(UserRepository userRepository, PatientRepository patientRepository) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
    }

    public boolean canAccessPatient(Authentication authentication, Long patientId) {
        if (authentication == null || !authentication.isAuthenticated() || patientId == null) {
            return false;
        }

        Set<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        // Clinical staff and auditors have broad authorized access
        if (roles.contains("ROLE_ADMIN") || roles.contains("ROLE_DOCTOR") ||
            roles.contains("ROLE_NURSE") || roles.contains("ROLE_AUDITOR")) {
            return true;
        }

        // Patients can only access their own linked patient record
        if (roles.contains("ROLE_PATIENT")) {
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

        Set<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        if (roles.contains("ROLE_ADMIN") || roles.contains("ROLE_DOCTOR") ||
            roles.contains("ROLE_NURSE") || roles.contains("ROLE_AUDITOR")) {
            return true;
        }

        if (roles.contains("ROLE_PATIENT")) {
            Optional<User> userOpt = userRepository.findByUsername(authentication.getName());
            return userOpt.isPresent() && userOpt.get().getId().equals(userId);
        }

        return false;
    }
}
