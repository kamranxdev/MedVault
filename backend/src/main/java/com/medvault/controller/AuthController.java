package com.medvault.controller;

import com.medvault.dto.JwtAuthResponse;
import com.medvault.dto.LoginRequest;
import com.medvault.dto.RegisterRequest;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.model.Role;
import com.medvault.model.User;
import com.medvault.repository.RoleRepository;
import com.medvault.repository.UserRepository;
import com.medvault.security.JwtTokenProvider;
import com.medvault.service.AuditService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuditService auditService;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider,
                          AuditService auditService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.auditService = auditService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            User user = userRepository.findByUsernameOrEmail(loginRequest.getUsername(), loginRequest.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User record not found"));
            Set<String> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());

            String primaryRole = roles.isEmpty() ? "ROLE_USER" : roles.iterator().next();
            auditService.logAction(user.getUsername(), primaryRole, "LOGIN", "AUTH", String.valueOf(user.getId()), "User authenticated successfully");

            return ResponseEntity.ok(new JwtAuthResponse(
                    jwt,
                    user.getUsername(),
                    user.getFullName(),
                    roles,
                    user.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "UNAUTHORIZED", "message", "Invalid username or password"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "BAD_REQUEST", "message", "Username is already taken!"));
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "BAD_REQUEST", "message", "Email is already in use!"));
        }

        User user = new User(
                registerRequest.getUsername(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getEmail(),
                registerRequest.getFullName()
        );

        user.setSpecialization(registerRequest.getSpecialization());
        user.setDepartment(registerRequest.getDepartment());
        user.setLicenseNumber(registerRequest.getLicenseNumber());
        user.setQualifications(registerRequest.getQualifications());
        user.setYearsOfExperience(registerRequest.getYearsOfExperience() != null ? registerRequest.getYearsOfExperience() : 5);
        user.setMedicalBoardState(registerRequest.getMedicalBoardState() != null ? registerRequest.getMedicalBoardState() : "State Medical Board");
        user.setVerificationStatus("VERIFIED");

        // Security rule: Public registration ONLY allows default ROLE_PATIENT to prevent privilege escalation.
        Role patientRole = roleRepository.findByName("ROLE_PATIENT")
                .orElseThrow(() -> new ResourceNotFoundException("Default ROLE_PATIENT standard role not found."));
        Set<Role> roles = new HashSet<>();
        roles.add(patientRole);

        user.setRoles(roles);
        User saved = userRepository.save(user);

        auditService.logAction(saved.getUsername(), "ROLE_PATIENT", "REGISTER", "USER", String.valueOf(saved.getId()), "Public user self-registered as ROLE_PATIENT");

        return ResponseEntity.ok(Map.of("message", "User registered successfully!", "userId", saved.getId()));
    }

    @PostMapping("/admin/create-user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUserByAdmin(@RequestBody RegisterRequest registerRequest, Authentication auth) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "BAD_REQUEST", "message", "Username is already taken!"));
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "BAD_REQUEST", "message", "Email is already in use!"));
        }

        Set<String> strRoles = registerRequest.getRoles();
        boolean isDoctor = strRoles != null && strRoles.stream().anyMatch(r -> r.equalsIgnoreCase("DOCTOR") || r.equalsIgnoreCase("ROLE_DOCTOR"));

        // Mandatory Doctor Credential Validation
        if (isDoctor) {
            if (registerRequest.getLicenseNumber() == null || registerRequest.getLicenseNumber().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "BAD_REQUEST", "message", "Doctor registration requires a valid Medical Practice License Number!"));
            }
            if (registerRequest.getQualifications() == null || registerRequest.getQualifications().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "BAD_REQUEST", "message", "Doctor registration requires documented Qualifications (e.g. MD, MBBS)!"));
            }
        }

        User user = new User(
                registerRequest.getUsername(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getEmail(),
                registerRequest.getFullName()
        );

        user.setSpecialization(registerRequest.getSpecialization());
        user.setDepartment(registerRequest.getDepartment());
        user.setLicenseNumber(registerRequest.getLicenseNumber());
        user.setQualifications(registerRequest.getQualifications());
        user.setYearsOfExperience(registerRequest.getYearsOfExperience() != null ? registerRequest.getYearsOfExperience() : 5);
        user.setMedicalBoardState(registerRequest.getMedicalBoardState() != null ? registerRequest.getMedicalBoardState() : "State Licensing Board");
        user.setVerificationStatus(isDoctor ? "VERIFIED" : "VERIFIED");

        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            Role defaultRole = roleRepository.findByName("ROLE_PATIENT").orElseThrow();
            roles.add(defaultRole);
        } else {
            for (String r : strRoles) {
                String roleName = r.startsWith("ROLE_") ? r : "ROLE_" + r.toUpperCase();
                Role userRole = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new ResourceNotFoundException("Role " + roleName + " not found."));
                roles.add(userRole);
            }
        }

        user.setRoles(roles);
        User saved = userRepository.save(user);

        auditService.logAction(auth, "CREATE_STAFF", "USER", String.valueOf(saved.getId()), "Admin created account for " + saved.getUsername() + " with roles: " + strRoles);

        return ResponseEntity.ok(Map.of("message", "Staff account created successfully!", "userId", saved.getId()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        Set<String> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());

        return ResponseEntity.ok(new JwtAuthResponse(
                null,
                user.getUsername(),
                user.getFullName(),
                roles,
                user.getId()
        ));
    }
}
