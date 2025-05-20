package dit.hua.gr.backend.service;

import dit.hua.gr.backend.model.AuthenticationResponse;
import dit.hua.gr.backend.model.Role;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthenticationService authenticationService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password");
        testUser.setRole(Role.CLIENT);
    }

    @Test
    void register_ShouldCreateNewUserAndReturnToken() {
        // Arrange
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateToken(testUser)).thenReturn("jwt-token");

        // Act
        AuthenticationResponse response = authenticationService.register(testUser);

        // Assert
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());

        // Verify user was saved with correct properties
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        
        assertEquals("testuser", savedUser.getUsername());
        assertEquals("test@example.com", savedUser.getEmail());
        assertEquals("encodedPassword", savedUser.getPassword());
        assertEquals(Role.CLIENT, savedUser.getRole());
        assertFalse(savedUser.isVerified());
    }

    @Test
    void authenticate_ShouldAuthenticateUserAndReturnToken() {
        // Arrange
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtService.generateToken(testUser)).thenReturn("jwt-token");

        // Act
        AuthenticationResponse response = authenticationService.authenticate(testUser);

        // Assert
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        
        // Verify authentication was attempted with correct credentials
        ArgumentCaptor<UsernamePasswordAuthenticationToken> tokenCaptor = 
                ArgumentCaptor.forClass(UsernamePasswordAuthenticationToken.class);
        verify(authenticationManager).authenticate(tokenCaptor.capture());
        
        UsernamePasswordAuthenticationToken authToken = tokenCaptor.getValue();
        assertEquals("testuser", authToken.getPrincipal());
        assertEquals("password", authToken.getCredentials());
    }

    @Test
    void authenticate_WhenUserNotFound_ShouldThrowException() {
        // Arrange
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(Exception.class, () -> authenticationService.authenticate(testUser));
    }
} 