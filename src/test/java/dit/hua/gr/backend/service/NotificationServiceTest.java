package dit.hua.gr.backend.service;

import dit.hua.gr.backend.dto.NotificationDTO;
import dit.hua.gr.backend.model.Notification;
import dit.hua.gr.backend.model.NotificationType;
import dit.hua.gr.backend.model.Role;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User testUser;
    private Notification testNotification;

    @BeforeEach
    void setUp() {
        // Δημιουργία test user
        testUser = new User();
        testUser.setId(1);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password");
        testUser.setRole(Role.FREELANCER);
        testUser.setVerified(true);

        // Δημιουργία test notification
        testNotification = new Notification();
        testNotification.setId(1L);
        testNotification.setUser(testUser);
        testNotification.setMessage("Test notification message");
        testNotification.setTimestamp(LocalDateTime.now());
        testNotification.setRead(false);
        testNotification.setType(NotificationType.APPLICATION_RECEIVED);
    }

    @Test
    void createNotification_ShouldSaveAndReturnNotification() {
        // Arrange
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // Act
        Notification savedNotification = notificationService.createNotification(
                testUser, "Test notification message", NotificationType.APPLICATION_RECEIVED);

        // Assert
        assertNotNull(savedNotification);
        assertEquals(testNotification.getId(), savedNotification.getId());
        assertEquals(testNotification.getMessage(), savedNotification.getMessage());
        assertEquals(testNotification.getType(), savedNotification.getType());
        assertEquals(testNotification.getUser(), savedNotification.getUser());
        assertFalse(savedNotification.isRead());
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void getUserNotifications_ShouldReturnUserNotificationsAsDTO() {
        // Arrange
        Notification notification2 = new Notification();
        notification2.setId(2L);
        notification2.setUser(testUser);
        notification2.setMessage("Another test notification");
        notification2.setTimestamp(LocalDateTime.now().minusHours(1));
        notification2.setRead(true);
        notification2.setType(NotificationType.APPLICATION_ACCEPTED);

        List<Notification> notifications = Arrays.asList(testNotification, notification2);
        when(notificationRepository.findByUserOrderByTimestampDesc(testUser)).thenReturn(notifications);

        // Act
        List<NotificationDTO> notificationDTOs = notificationService.getUserNotifications(testUser);

        // Assert
        assertEquals(2, notificationDTOs.size());
        assertEquals(testNotification.getId(), notificationDTOs.get(0).getId());
        assertEquals(testNotification.getMessage(), notificationDTOs.get(0).getMessage());
        assertEquals(testNotification.getType(), notificationDTOs.get(0).getType());
        assertFalse(notificationDTOs.get(0).isRead());
        
        assertEquals(notification2.getId(), notificationDTOs.get(1).getId());
        assertEquals(notification2.getMessage(), notificationDTOs.get(1).getMessage());
        assertEquals(notification2.getType(), notificationDTOs.get(1).getType());
        assertTrue(notificationDTOs.get(1).isRead());
        
        verify(notificationRepository, times(1)).findByUserOrderByTimestampDesc(testUser);
    }

    @Test
    void markAsRead_ShouldMarkNotificationAsRead() {
        // Arrange
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // Act
        notificationService.markAsRead(1L);

        // Assert
        assertTrue(testNotification.isRead());
        verify(notificationRepository).findById(1L);
        verify(notificationRepository).save(testNotification);
    }

    @Test
    void markAsRead_WhenNotificationDoesNotExist_ShouldDoNothing() {
        // Arrange
        when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

        // Act
        notificationService.markAsRead(999L);

        // Assert
        verify(notificationRepository).findById(999L);
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    void markAllAsRead_ShouldMarkAllUserNotificationsAsRead() {
        // Arrange
        Notification notification1 = new Notification();
        notification1.setId(1L);
        notification1.setUser(testUser);
        notification1.setRead(false);

        Notification notification2 = new Notification();
        notification2.setId(2L);
        notification2.setUser(testUser);
        notification2.setRead(false);

        List<Notification> unreadNotifications = Arrays.asList(notification1, notification2);
        when(notificationRepository.findByUserAndReadFalse(testUser)).thenReturn(unreadNotifications);
        when(notificationRepository.saveAll(anyList())).thenReturn(unreadNotifications);

        // Act
        notificationService.markAllAsRead(testUser);

        // Assert
        assertTrue(notification1.isRead());
        assertTrue(notification2.isRead());
        verify(notificationRepository).findByUserAndReadFalse(testUser);
        verify(notificationRepository).saveAll(unreadNotifications);
    }

    @Test
    void getUnreadCount_ShouldReturnNumberOfUnreadNotifications() {
        // Arrange
        when(notificationRepository.countByUserAndReadFalse(testUser)).thenReturn(5L);

        // Act
        long unreadCount = notificationService.getUnreadCount(testUser);

        // Assert
        assertEquals(5L, unreadCount);
        verify(notificationRepository).countByUserAndReadFalse(testUser);
    }

    @Test
    void convertToDTO_ShouldConvertNotificationToDTO() {
        // Arrange - Χρησιμοποιούμε private μέθοδο μέσω reflection
        java.lang.reflect.Method method;
        try {
            method = NotificationService.class.getDeclaredMethod("convertToDTO", Notification.class);
            method.setAccessible(true);

            // Act
            NotificationDTO dto = (NotificationDTO) method.invoke(notificationService, testNotification);

            // Assert
            assertEquals(testNotification.getId(), dto.getId());
            assertEquals(testNotification.getMessage(), dto.getMessage());
            assertEquals(testNotification.isRead(), dto.isRead());
            assertEquals(testNotification.getType(), dto.getType());
            assertEquals(testNotification.getTimestamp().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME), dto.getTimestamp());
        } catch (Exception e) {
            fail("Exception thrown while testing convertToDTO: " + e.getMessage());
        }
    }
} 