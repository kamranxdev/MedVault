package com.medvault;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medvault.dto.RegisterRequest;
import com.medvault.model.User;
import com.medvault.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testPublicRegistrationForcesRolePatient() throws Exception {
        String username = "test_self_reg_" + System.currentTimeMillis();
        RegisterRequest request = new RegisterRequest();
        request.setUsername(username);
        request.setPassword("Password123!");
        request.setEmail(username + "@medvault.org");
        request.setFullName("Test Self Reg");
        request.setRoles(Set.of("ROLE_ADMIN", "ROLE_DOCTOR")); // Malicious role escalation attempt

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        Optional<User> userOpt = userRepository.findByUsername(username);
        assertTrue(userOpt.isPresent());
        User user = userOpt.get();
        assertEquals(1, user.getRoles().size());
        assertTrue(user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_PATIENT")), "Self-registration must only grant ROLE_PATIENT");
        assertFalse(user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN")), "Self-registration must block ROLE_ADMIN escalation");
    }

    @Autowired
    private com.medvault.repository.PatientRepository patientRepository;

    @Test
    public void testPublicRegistrationCreatesLinkedPatientProfile() throws Exception {
        String username = "test_onboard_" + System.currentTimeMillis();
        RegisterRequest request = new RegisterRequest();
        request.setUsername(username);
        request.setPassword("Password123!");
        request.setEmail(username + "@medvault.org");
        request.setFullName("Test Patient Onboard");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        Optional<User> userOpt = userRepository.findByUsername(username);
        assertTrue(userOpt.isPresent());
        User user = userOpt.get();

        Optional<com.medvault.model.Patient> patientOpt = patientRepository.findByUserId(user.getId());
        assertTrue(patientOpt.isPresent(), "Self-registration must automatically instantiate a linked Patient profile");
        com.medvault.model.Patient patient = patientOpt.get();
        assertNotNull(patient.getPatientCode());
        assertTrue(patient.getPatientCode().startsWith("PAT-"));
        assertEquals("Test Patient Onboard", patient.getFullName());
    }

    @Test
    public void testUnauthenticatedAdminCreateUserFails() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("fake_doctor");
        request.setPassword("Password123!");
        request.setEmail("fake_doc@medvault.org");
        request.setFullName("Fake Doctor");
        request.setRoles(Set.of("ROLE_DOCTOR"));

        mockMvc.perform(post("/api/auth/admin/create-user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testAllRoleLoginsSucceed() throws Exception {
        String[][] credentials = {
            {"admin", "admin123"},
            {"doctor", "doctor123"},
            {"nurse", "nurse123"},
            {"receptionist", "receptionist123"},
            {"labtech", "labtech123"},
            {"pharmacist", "pharmacist123"},
            {"billing", "billing123"},
            {"auditor", "auditor123"},
            {"patient", "patient123"}
        };

        for (String[] cred : credentials) {
            com.medvault.dto.LoginRequest login = new com.medvault.dto.LoginRequest();
            login.setUsername(cred[0]);
            login.setPassword(cred[1]);

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(login)))
                    .andExpect(status().isOk());
        }
    }
}
