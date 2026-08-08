package com.medvault.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private static final String TEST_SECRET = "MedVaultSuperSecretSigningKeyForJwtTokens998877665544332211";

    @BeforeEach
    public void setUp() {
        tokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(tokenProvider, "jwtSecret", TEST_SECRET);
        ReflectionTestUtils.setField(tokenProvider, "jwtExpirationDate", 3600000L); // 1 hour
    }

    @Test
    public void testGenerateAndValidateToken_Success() {
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("doctor_mahtab");

        String token = tokenProvider.generateToken(auth);

        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals("doctor_mahtab", tokenProvider.getUsernameFromJwt(token));
    }

    @Test
    public void testValidateToken_InvalidTokenReturnsFalse() {
        assertFalse(tokenProvider.validateToken("invalid.jwt.token"));
        assertFalse(tokenProvider.validateToken(""));
        assertFalse(tokenProvider.validateToken(null));
    }

    @Test
    public void testValidateToken_ExpiredTokenReturnsFalse() {
        ReflectionTestUtils.setField(tokenProvider, "jwtExpirationDate", -1000L); // Expired 1 sec ago
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("expired_user");

        String expiredToken = tokenProvider.generateToken(auth);

        assertFalse(tokenProvider.validateToken(expiredToken));
    }
}
