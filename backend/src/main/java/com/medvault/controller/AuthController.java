package com.medvault.controller;

import com.medvault.dto.JwtAuthResponse;
import com.medvault.dto.LoginRequest;
import com.medvault.dto.RegisterRequest;
import com.medvault.model.AuditLog;
import com.medvault.model.Role;
import com.medvault.model.User;
import com.medvault.repository.AuditLogRepository;
import com.medvault.repository.RoleRepository;
import com.medvault.repository.UserRepository;
import com.medvault.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
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
    private final AuditLogRepository auditLogRepository;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider,
                          AuditLogRepository auditLogRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.auditLogRepository = auditLogRepository;
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

            User user = userRepository.findByUsernameOrEmail(loginRequest.getUsername(), loginRequest.getUsername()).orElseThrow();
            Set<String> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());

            try {
                auditLogRepository.save(new AuditLog(
                        user.getUsername(),
                        roles.isEmpty() ? "ROLE_USER" : roles.iterator().next(),
                        "LOGIN",
                        "AUTH",
                        "User logged in successfully"
                ));
            } catch (Exception auditEx) {
                System.err.println("[AuthController] Notice: Audit log entry skipped due to DB constraint: " + auditEx.getMessage());
            }

            return ResponseEntity.ok(new JwtAuthResponse(
                    jwt,
                    user.getUsername(),
                    user.getFullName(),
                    roles,
                    user.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User user = new User(
                registerRequest.getUsername(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getEmail(),
                registerRequest.getFullName()
        );

        user.setSpecialization(registerRequest.getSpecialization());
        user.setDepartment(registerRequest.getDepartment());

        Set<String> strRoles = registerRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            Role patientRole = roleRepository.findByName("ROLE_PATIENT")
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(patientRole);
        } else {
            strRoles.forEach(role -> {
                String roleName = role.startsWith("ROLE_") ? role : "ROLE_" + role.toUpperCase();
                Role userRole = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Error: Role " + roleName + " is not found."));
                roles.add(userRole);
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
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
