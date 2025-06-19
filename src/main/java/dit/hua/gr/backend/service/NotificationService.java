package dit.hua.gr.backend.service;

import dit.hua.gr.backend.dto.NotificationDTO;
import dit.hua.gr.backend.model.Notification;
import dit.hua.gr.backend.model.NotificationType;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Notification createNotification(User user, String message, NotificationType type) {
        try {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setMessage(message);
            notification.setType(type);
            notification.setTimestamp(LocalDateTime.now());
            notification.setRead(false);

            return notificationRepository.save(notification);
        } catch (Exception e) {
            System.err.println("Error creating notification for user " + user.getUsername() + ": " + e.getMessage());
            throw new RuntimeException("Failed to create notification", e);
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getUserNotifications(User user) {
        try {
            List<Notification> notifications = notificationRepository.findByUserOrderByTimestampDesc(user);
            return notifications.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching notifications for user " + user.getUsername() + ": " + e.getMessage());
            throw new RuntimeException("Failed to fetch notifications", e);
        }
    }

    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setMessage(notification.getMessage());
        dto.setTimestamp(notification.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        dto.setRead(notification.isRead());
        dto.setType(notification.getType());
        return dto;
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        try {
            notificationRepository.findById(notificationId).ifPresent(notification -> {
                notification.setRead(true);
                notificationRepository.save(notification);
            });
        } catch (Exception e) {
            System.err.println("Error marking notification " + notificationId + " as read: " + e.getMessage());
            throw new RuntimeException("Failed to mark notification as read", e);
        }
    }

    @Transactional
    public void markAllAsRead(User user) {
        try {
            List<Notification> unreadNotifications = notificationRepository.findByUserAndReadFalse(user);
            unreadNotifications.forEach(notification -> notification.setRead(true));
            notificationRepository.saveAll(unreadNotifications);
        } catch (Exception e) {
            System.err.println("Error marking all notifications as read for user " + user.getUsername() + ": " + e.getMessage());
            throw new RuntimeException("Failed to mark all notifications as read", e);
        }
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        try {
            return notificationRepository.countByUserAndReadFalse(user);
        } catch (Exception e) {
            System.err.println("Error getting unread count for user " + user.getUsername() + ": " + e.getMessage());
            return 0;
        }
    }
}