package dit.hua.gr.backend.service;

import dit.hua.gr.backend.model.Role;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindUserById() {
        // Arrange
        Integer userId = 1;
        User expectedUser = new User();
        expectedUser.setId(userId);
        expectedUser.setUsername("testuser");
        expectedUser.setEmail("test@example.com");
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(expectedUser));

        // Act
        Optional<User> result = userService.findUserById(userId);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(userId, result.get().getId());
        assertEquals("testuser", result.get().getUsername());
        assertEquals("test@example.com", result.get().getEmail());
        verify(userRepository, times(1)).findById(userId);
    }

    @Test
    void testFindUserByUsername() {
        // Arrange
        String username = "testuser";
        User expectedUser = new User();
        expectedUser.setId(1);
        expectedUser.setUsername(username);
        expectedUser.setEmail("test@example.com");
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(expectedUser));

        // Act
        Optional<User> result = userService.findUserByUsername(username);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(username, result.get().getUsername());
        verify(userRepository, times(1)).findByUsername(username);
    }

    @Test
    void testSaveUser() {
        // Arrange
        User user = new User();
        user.setUsername("newuser");
        user.setEmail("new@example.com");
        user.setPassword("password");
        user.setRole(Role.CLIENT);
        
        User savedUser = new User();
        savedUser.setId(1);
        savedUser.setUsername("newuser");
        savedUser.setEmail("new@example.com");
        savedUser.setPassword("password");
        savedUser.setRole(Role.CLIENT);
        
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // Act
        User result = userService.saveUser(user);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getId());
        assertEquals("newuser", result.getUsername());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testVerifyFreelancer() {
        // Arrange
        String username = "freelancer";
        User user = new User();
        user.setId(1);
        user.setUsername(username);
        user.setEmail("freelancer@example.com");
        user.setRole(Role.FREELANCER);
        user.setVerified(false);
        
        User verifiedUser = new User();
        verifiedUser.setId(1);
        verifiedUser.setUsername(username);
        verifiedUser.setEmail("freelancer@example.com");
        verifiedUser.setRole(Role.FREELANCER);
        verifiedUser.setVerified(true);
        
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(verifiedUser);
        doNothing().when(emailService).sendVerificationEmail(anyString(), anyString());

        // Act
        User result = userService.verifyFreelancer(username, true);

        // Assert
        assertTrue(result.isVerified());
        verify(userRepository).findByUsername(username);
        verify(userRepository).save(any(User.class));
        verify(emailService).sendVerificationEmail(eq("freelancer@example.com"), eq(username));
    }
} 