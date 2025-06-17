package dit.hua.gr.backend.controller;

import dit.hua.gr.backend.dto.NotificationDTO;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.model.NotificationType;
import dit.hua.gr.backend.service.NotificationService;
import dit.hua.gr.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {
    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'FREELANCER', 'ADMIN')")
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(Authentication authentication) {
        System.out.println("Getting notifications for user: " + authentication.getName());
        User user = userService.findUserByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<NotificationDTO> notifications = notificationService.getUserNotifications(user);
        System.out.println("Found " + notifications.size() + " notifications for user: " + user.getUsername());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyRole('CLIENT', 'FREELANCER', 'ADMIN')")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        System.out.println("Getting unread count for user: " + authentication.getName());
        User user = userService.findUserByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        long count = notificationService.getUnreadCount(user);
        System.out.println("Unread count for user " + user.getUsername() + ": " + count);
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('CLIENT', 'FREELANCER', 'ADMIN')")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/mark-all-read")
    @PreAuthorize("hasAnyRole('CLIENT', 'FREELANCER', 'ADMIN')")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        try {
            User user = userService.findUserByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            notificationService.markAllAsRead(user);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Test endpoint to create a notification manually
    @PostMapping("/test")
    @PreAuthorize("hasAnyRole('CLIENT', 'FREELANCER', 'ADMIN')")
    public ResponseEntity<String> createTestNotification(Authentication authentication) {
        try {
            User user = userService.findUserByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            notificationService.createNotification(user, "This is a test notification", NotificationType.APPLICATION_RECEIVED);
            return ResponseEntity.ok("Test notification created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating test notification: " + e.getMessage());
        }
    }
}