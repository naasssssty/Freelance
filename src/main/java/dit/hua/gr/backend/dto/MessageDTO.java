package dit.hua.gr.backend.dto;

public class MessageDTO {
    private Long id;
    private String content;
    private String sender;
    private String timestamp;

    public MessageDTO(Long id, String content, String sender, String timestamp) {
        this.id = id;
        this.content = content;
        this.sender = sender;
        this.timestamp = timestamp;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public String getSender() {
        return sender;
    }

    public String getTimestamp() {
        return timestamp;
    }
}