package dit.hua.gr.backend.dto;

import dit.hua.gr.backend.model.ReportStatus;
import java.time.LocalDateTime;

public class ReportDTO {
    private Integer id;
    private String projectTitle;
    private String reporterUsername;
    private String description;
    private ReportStatus status;
    private LocalDateTime createdAt;
    private String adminResponse;

    // Constructor
    public ReportDTO(Integer id, String projectTitle, String reporterUsername, 
                    String description, ReportStatus status, 
                    LocalDateTime createdAt, String adminResponse) {
        this.id = id;
        this.projectTitle = projectTitle;
        this.reporterUsername = reporterUsername;
        this.description = description;
        this.status = status;
        this.createdAt = createdAt;
        this.adminResponse = adminResponse;
    }

    // Getters and setters
    public Integer getId() {
        return id;
    }

    public String getProjectTitle() {
        return projectTitle;
    }

    public String getReporterUsername() {
        return reporterUsername;
    }

    public String getDescription() {
        return description;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getAdminResponse() {
        return adminResponse;
    }
} 