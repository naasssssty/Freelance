package dit.hua.gr.backend.service;

import dit.hua.gr.backend.dto.UserDTO;
import dit.hua.gr.backend.model.Role;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Create a test user
        testUser = new User();
        testUser.setId(1);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password");
        testUser.setRole(Role.FREELANCER);
        testUser.setVerified(false);
    }

    @Test
    void saveUser_ShouldSaveAndReturnUser() {
        // Arrange
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        User savedUser = userService.saveUser(testUser);

        // Assert
        assertNotNull(savedUser);
        assertEquals(testUser.getId(), savedUser.getId());
        assertEquals(testUser.getUsername(), savedUser.getUsername());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void verifyFreelancer_WhenUserExists_ShouldVerifyAndSendEmail() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        doNothing().when(emailService).sendVerificationEmail(anyString(), anyString());

        // Act
        User verifiedUser = userService.verifyFreelancer("testuser", true);

        // Assert
        assertTrue(verifiedUser.isVerified());
        verify(userRepository).findByUsername("testuser");
        verify(userRepository).save(testUser);
        verify(emailService).sendVerificationEmail(testUser.getEmail(), testUser.getUsername());
    }

    @Test
    void verifyFreelancer_WhenUserDoesNotExist_ShouldThrowException() {
        // Arrange
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.verifyFreelancer("nonexistent", true);
        });

        assertEquals("User with username nonexistent not found", exception.getMessage());
        verify(userRepository).findByUsername("nonexistent");
        verify(userRepository, never()).save(any(User.class));
        verify(emailService, never()).sendVerificationEmail(anyString(), anyString());
    }

    @Test
    void findUserById_WhenUserExists_ShouldReturnUser() {
        // Arrange
        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));

        // Act
        Optional<User> foundUser = userService.findUserById(1);

        // Assert
        assertTrue(foundUser.isPresent());
        assertEquals(testUser.getId(), foundUser.get().getId());
        verify(userRepository).findById(1);
    }

    @Test
    void findUserById_WhenUserDoesNotExist_ShouldReturnEmpty() {
        // Arrange
        when(userRepository.findById(999)).thenReturn(Optional.empty());

        // Act
        Optional<User> foundUser = userService.findUserById(999);

        // Assert
        assertFalse(foundUser.isPresent());
        verify(userRepository).findById(999);
    }

    @Test
    void findUserByUsername_WhenUserExists_ShouldReturnUser() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act
        Optional<User> foundUser = userService.findUserByUsername("testuser");

        // Assert
        assertTrue(foundUser.isPresent());
        assertEquals(testUser.getUsername(), foundUser.get().getUsername());
        verify(userRepository).findByUsername("testuser");
    }

    @Test
    void findUserByUsername_WhenUserDoesNotExist_ShouldReturnEmpty() {
        // Arrange
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act
        Optional<User> foundUser = userService.findUserByUsername("nonexistent");

        // Assert
        assertFalse(foundUser.isPresent());
        verify(userRepository).findByUsername("nonexistent");
    }

    @Test
    void findAllUsers_ShouldReturnListOfUserDTOs() {
        // Arrange
        User user1 = new User();
        user1.setId(1);
        user1.setUsername("user1");
        user1.setEmail("user1@example.com");
        user1.setRole(Role.CLIENT);
        user1.setVerified(true);

        User user2 = new User();
        user2.setId(2);
        user2.setUsername("user2");
        user2.setEmail("user2@example.com");
        user2.setRole(Role.FREELANCER);
        user2.setVerified(false);

        when(userRepository.findAll()).thenReturn(Arrays.asList(user1, user2));

        // Act
        List<UserDTO> userDTOs = userService.findAllUsers();

        // Assert
        assertEquals(2, userDTOs.size());
        assertEquals("user1", userDTOs.get(0).getUsername());
        assertEquals("user2", userDTOs.get(1).getUsername());
        assertEquals(Role.CLIENT, userDTOs.get(0).getRole());
        assertEquals(Role.FREELANCER, userDTOs.get(1).getRole());
        assertTrue(userDTOs.get(0).getVerified());
        assertFalse(userDTOs.get(1).getVerified());
        verify(userRepository).findAll();
    }

    @Test
    void updateUser_WhenUserExists_ShouldUpdateAndReturnUser() {
        // Arrange
        User updatedUser = new User();
        updatedUser.setUsername("updateduser");
        updatedUser.setEmail("updated@example.com");
        updatedUser.setPassword("newpassword");
        updatedUser.setRole(Role.ADMIN);

        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        User result = userService.updateUser(1, updatedUser);

        // Assert
        assertEquals(updatedUser.getUsername(), result.getUsername());
        assertEquals(updatedUser.getEmail(), result.getEmail());
        assertEquals(updatedUser.getPassword(), result.getPassword());
        assertEquals(updatedUser.getRole(), result.getRole());
        verify(userRepository).findById(1);
        verify(userRepository).save(testUser);
    }

    @Test
    void updateUser_WhenUserDoesNotExist_ShouldThrowException() {
        // Arrange
        User updatedUser = new User();
        when(userRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.updateUser(999, updatedUser);
        });

        assertEquals("User with id 999 not found", exception.getMessage());
        verify(userRepository).findById(999);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void deleteUser_WhenUserExists_ShouldDeleteUser() {
        // Arrange
        when(userRepository.existsById(1)).thenReturn(true);
        doNothing().when(userRepository).deleteById(1);

        // Act
        userService.deleteUser(1);

        // Assert
        verify(userRepository).existsById(1);
        verify(userRepository).deleteById(1);
    }

    @Test
    void deleteUser_WhenUserDoesNotExist_ShouldThrowException() {
        // Arrange
        when(userRepository.existsById(999)).thenReturn(false);

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.deleteUser(999);
        });

        assertEquals("User with id 999 not found", exception.getMessage());
        verify(userRepository).existsById(999);
        verify(userRepository, never()).deleteById(anyInt());
    }
} 