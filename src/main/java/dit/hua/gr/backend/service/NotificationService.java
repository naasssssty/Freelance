package dit.hua.gr.backend.service;

import dit.hua.gr.backend.dto.NotificationDTO;
import dit.hua.gr.backend.model.Notification;
import dit.hua.gr.backend.model.NotificationType;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

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

    public Notification createNotification(User user, String message, NotificationType type) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);
        return notificationRepository.save(notification);
    }

    public List<NotificationDTO> getUserNotifications(User user) {
        List<Notification> notifications = notificationRepository.findByUserOrderByTimestampDesc(user);
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private NotificationDTO convertToDTO(Notification notification) {
        return new NotificationDTO(
                notification.getId(),
                notification.getMessage(),
                notification.getTimestamp().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                notification.isRead(),
                notification.getType());
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    public void markAllAsRead(User user) {
        List<Notification> notifications = notificationRepository.findByUserAndReadFalse(user);
        notifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndReadFalse(user);
    }
}