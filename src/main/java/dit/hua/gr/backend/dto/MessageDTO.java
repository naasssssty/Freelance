package dit.hua.gr.backend.dto;

public class MessageDTO {
    private Integer id;
    private String content;
    private String senderUsername;
    private String timestamp;
    private boolean isRead;

    public MessageDTO() {
    }

    public MessageDTO(Integer id, String content, String senderUsername, String timestamp, boolean isRead) {
        this.id = id;
        this.content = content;
        this.senderUsername = senderUsername;
        this.timestamp = timestamp;
        this.isRead = isRead;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSenderUsername() {
        return senderUsername;
    }

    public void setSenderUsername(String senderUsername) {
        this.senderUsername = senderUsername;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }
}