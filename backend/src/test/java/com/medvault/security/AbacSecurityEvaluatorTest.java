package com.medvault.security;

import com.medvault.model.Patient;
import com.medvault.model.User;
import com.medvault.repository.PatientAssignmentRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class AbacSecurityEvaluatorTest {

    private PatientAssignmentRepository assignmentRepository;
    private UserRepository userRepository;
    private PatientRepository patientRepository;
    private AbacSecurityEvaluator evaluator;

    @BeforeEach
    public void setUp() {
        assignmentRepository = mock(PatientAssignmentRepository.class);
        userRepository = mock(UserRepository.class);
        patientRepository = mock(PatientRepository.class);

        evaluator = new AbacSecurityEvaluator(assignmentRepository, userRepository, patientRepository);
    }

    @Test
    public void testSysAdminBypassesRelationshipCheck() {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getName()).thenReturn("sysadmin");
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_SYS_ADMIN"))).when(auth).getAuthorities();

        boolean allowed = evaluator.hasTreatmentRelationship(auth, 1L);
        assertTrue(allowed, "ROLE_SYS_ADMIN must bypass treatment relationship check");
    }

    @Test
    public void testAuditorBypassesRelationshipCheck() {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getName()).thenReturn("compliance_auditor");
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_AUDITOR"))).when(auth).getAuthorities();

        boolean allowed = evaluator.hasTreatmentRelationship(auth, 1L);
        assertTrue(allowed, "ROLE_AUDITOR must bypass treatment relationship check");
    }

    @Test
    public void testPatientSelfAccessAllowed() {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getName()).thenReturn("patient_user");
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_PATIENT"))).when(auth).getAuthorities();

        User user = new User();
        user.setUsername("patient_user");

        Patient patient = new Patient();
        patient.setId(1L);
        patient.setUser(user);

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        boolean allowed = evaluator.hasTreatmentRelationship(auth, 1L);
        assertTrue(allowed, "Patient user accessing their own patient record must be allowed");
    }

    @Test
    public void testActiveCareTeamAssignmentAllowed() {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getName()).thenReturn("doctor_mahtab");
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_DOCTOR"))).when(auth).getAuthorities();

        when(patientRepository.findById(1L)).thenReturn(Optional.of(new Patient()));
        when(assignmentRepository.existsActiveAssignmentByPatientIdAndUsername(1L, "doctor_mahtab")).thenReturn(true);

        boolean allowed = evaluator.hasTreatmentRelationship(auth, 1L);
        assertTrue(allowed, "Active care team assignment must grant access");
    }

    @Test
    public void testDepartmentMatchFallbackAllowed() {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getName()).thenReturn("er_doctor");
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_DOCTOR"))).when(auth).getAuthorities();

        User clinician = new User();
        clinician.setUsername("er_doctor");
        clinician.setDepartment("EMERGENCY");

        Patient patient = new Patient();
        patient.setId(1L);
        patient.setDepartment("EMERGENCY");

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(userRepository.findByUsername("er_doctor")).thenReturn(Optional.of(clinician));
        when(assignmentRepository.existsActiveAssignmentByPatientIdAndUsername(1L, "er_doctor")).thenReturn(false);

        boolean allowed = evaluator.hasTreatmentRelationship(auth, 1L);
        assertTrue(allowed, "On-duty clinician in matching department must be allowed");
    }

    @Test
    public void testUnassignedDoctorDifferentDepartmentDenied() {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getName()).thenReturn("doctor_rajesh");
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_DOCTOR"))).when(auth).getAuthorities();

        User clinician = new User();
        clinician.setUsername("doctor_rajesh");
        clinician.setDepartment("CARDIOLOGY");

        Patient patient = new Patient();
        patient.setId(1L);
        patient.setDepartment("PEDIATRICS");

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(userRepository.findByUsername("doctor_rajesh")).thenReturn(Optional.of(clinician));
        when(assignmentRepository.existsActiveAssignmentByPatientIdAndUsername(1L, "doctor_rajesh")).thenReturn(false);

        boolean allowed = evaluator.hasTreatmentRelationship(auth, 1L);
        assertFalse(allowed, "Unassigned clinician in different department must be denied");
    }

    @Test
    public void testNullOrUnauthenticatedReturnsFalse() {
        assertFalse(evaluator.hasTreatmentRelationship(null, 1L));

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(false);
        assertFalse(evaluator.hasTreatmentRelationship(auth, 1L));
    }
}
