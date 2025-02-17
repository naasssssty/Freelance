package dit.hua.gr.backend.dto;

import dit.hua.gr.backend.model.NotificationType;

public class NotificationDTO {
    private Long id;
    private String message;
    private String timestamp;
    private boolean read;
    private NotificationType type;

    // Default constructor
    public NotificationDTO() {
    }

    // Constructor with all fields
    public NotificationDTO(Long id, String message, String timestamp, boolean read, NotificationType type) {
        this.id = id;
        this.message = message;
        this.timestamp = timestamp;
        this.read = read;
        this.type = type;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }
}