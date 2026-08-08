package com.medvault.security;

import com.medvault.model.Patient;
import com.medvault.model.User;
import com.medvault.repository.PatientAssignmentRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("abacEvaluator")
public class AbacSecurityEvaluator {

    private final PatientAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;

    public AbacSecurityEvaluator(PatientAssignmentRepository assignmentRepository,
                                UserRepository userRepository,
                                PatientRepository patientRepository) {
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
    }

    /**
     * Evaluates if the authenticated user has an active care team assignment with the patient,
     * or shares the same department, or has platform-wide access (SYS_ADMIN, AUDITOR),
     * or is the patient themselves.
     */
    public boolean hasTreatmentRelationship(Authentication authentication, Long patientId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String username = authentication.getName();

        // 1. System Admins and Auditors have platform-level inspection authority
        if (hasRole(authentication, "ROLE_SYS_ADMIN") || hasRole(authentication, "ROLE_ADMIN") || hasRole(authentication, "ROLE_AUDITOR")) {
            return true;
        }

        // 2. Check if the user is the patient themselves
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (patientOpt.isPresent() && patientOpt.get().getUser() != null) {
            if (patientOpt.get().getUser().getUsername().equalsIgnoreCase(username)) {
                return true;
            }
        }

        // 3. Check active care team assignment
        boolean hasAssignment = assignmentRepository.existsActiveAssignmentByPatientIdAndUsername(patientId, username);
        if (hasAssignment) {
            return true;
        }

        // 4. Fallback department match check for on-duty providers
        Optional<User> currentUserOpt = userRepository.findByUsername(username);
        if (currentUserOpt.isPresent() && patientOpt.isPresent()) {
            User currentUser = currentUserOpt.get();
            Patient patient = patientOpt.get();

            // If user and patient belong to the same department or clinician is Doctor/Nurse in Emergency/General
            if (currentUser.getDepartment() != null && currentUser.getDepartment().equalsIgnoreCase(patient.getDepartment())) {
                return true;
            }

            // Allow doctors & nurses general clinical access if no explicit assignment table restriction
            if (hasRole(authentication, "ROLE_DOCTOR") || hasRole(authentication, "ROLE_NURSE")) {
                return true;
            }
        }

        return false;
    }

    /**
     * Evaluates if the logged-in user is accessing their own user account or patient profile.
     */
    public boolean isSelf(Authentication authentication, Long userId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findById(userId);
        return userOpt.isPresent() && userOpt.get().getUsername().equalsIgnoreCase(username);
    }

    /**
     * Evaluates if the user possesses a specific permission code.
     */
    public boolean hasPermission(Authentication authentication, String permissionCode) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(auth -> auth.equals(permissionCode) || auth.equals("ROLE_SYS_ADMIN") || auth.equals("ROLE_ADMIN"));
    }

    private boolean hasRole(Authentication authentication, String roleName) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(auth -> auth.equals(roleName));
    }
}
