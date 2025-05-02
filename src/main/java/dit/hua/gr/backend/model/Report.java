package dit.hua.gr.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnoreProperties({"applications", "reports", "hibernateLazyInitializer"})
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    @JsonIgnoreProperties({"applications", "projects", "hibernateLazyInitializer"})
    private User reporter;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    private ReportStatus status = ReportStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private String adminResponse;

    // Προσθήκη βοηθητικών πεδίων για το frontend
    @Transient
    public String getProjectTitle() {
        return project != null ? project.getTitle() : null;
    }

    @Transient
    public String getReporterUsername() {
        return reporter != null ? reporter.getUsername() : null;
    }

    // Getters
    public Integer getId() {
        return id;
    }

    public Project getProject() {
        return project;
    }

    public User getReporter() {
        return reporter;
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

    // Setters
    public void setId(Integer id) {
        this.id = id;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public void setReporter(User reporter) {
        this.reporter = reporter;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setAdminResponse(String adminResponse) {
        this.adminResponse = adminResponse;
    }
} 