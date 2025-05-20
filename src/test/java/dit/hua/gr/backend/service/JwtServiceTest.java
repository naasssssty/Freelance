package dit.hua.gr.backend.service;

import dit.hua.gr.backend.model.Role;
import dit.hua.gr.backend.model.User;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtServiceTest {

    private JwtService jwtService;
    private User testUser;
    private String token;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        
        // Create a test user
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password");
        testUser.setRole(Role.CLIENT);
        testUser.setVerified(true);
        
        // Generate a token for the test user
        token = jwtService.generateToken(testUser);
    }

    @Test
    void extractUsername_ShouldReturnCorrectUsername() {
        // Act
        String username = jwtService.extractUsername(token);
        
        // Assert
        assertEquals("testuser", username);
    }

    @Test
    void extractRole_ShouldReturnCorrectRole() {
        // Act
        String role = jwtService.extractRole(token);
        
        // Assert
        assertEquals("CLIENT", role);
    }

    @Test
    void extractIsVerified_ShouldReturnCorrectVerificationStatus() {
        // Act
        boolean isVerified = jwtService.extractIsVerified(token);
        
        // Assert
        assertTrue(isVerified);
    }

    @Test
    void isValid_WithValidToken_ShouldReturnTrue() {
        // Arrange
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("testuser");
        
        // Act
        boolean isValid = jwtService.isValid(token, userDetails);
        
        // Assert
        assertTrue(isValid);
    }

    @Test
    void isValid_WithInvalidUsername_ShouldReturnFalse() {
        // Arrange
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("wronguser");
        
        // Act
        boolean isValid = jwtService.isValid(token, userDetails);
        
        // Assert
        assertFalse(isValid);
    }

    @Test
    void generateToken_ShouldCreateValidToken() {
        // Act
        String newToken = jwtService.generateToken(testUser);
        
        // Assert
        assertNotNull(newToken);
        assertTrue(newToken.length() > 0);
        
        // Verify token contains correct claims
        assertEquals("testuser", jwtService.extractUsername(newToken));
        assertEquals("CLIENT", jwtService.extractRole(newToken));
        assertTrue(jwtService.extractIsVerified(newToken));
    }

    @Test
    void extractClaim_ShouldExtractSpecificClaim() {
        // Act
        Date issuedAt = jwtService.extractClaim(token, Claims::getIssuedAt);
        
        // Assert
        assertNotNull(issuedAt);
        assertTrue(issuedAt.before(new Date()) || issuedAt.equals(new Date()));
    }
} 