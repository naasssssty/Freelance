package dit.hua.gr.backend.controller;

import dit.hua.gr.backend.dto.ReportDTO;
import dit.hua.gr.backend.model.Report;
import dit.hua.gr.backend.model.ReportStatus;
import dit.hua.gr.backend.model.Project;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.service.ReportService;
import dit.hua.gr.backend.service.ProjectService;
import dit.hua.gr.backend.service.UserService;
import dit.hua.gr.backend.service.NotificationService;
import dit.hua.gr.backend.model.NotificationType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/report")
@CrossOrigin(origins = {"http://localhost:3000", "https://ergohub.duckdns.org"})
public class ReportController {
    private final ReportService reportService;
    private final ProjectService projectService;
    private final UserService userService;
    private final NotificationService notificationService;

    public ReportController(ReportService reportService, ProjectService projectService, UserService userService,
            NotificationService notificationService) {
        this.reportService = reportService;
        this.projectService = projectService;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    @PreAuthorize("hasAnyRole('CLIENT', 'FREELANCER')")
    @PostMapping
    public ResponseEntity<Report> createReport(@RequestBody Map<String, Object> reportRequest) {
        try {
            // Δημιουργία νέου Report
            Report report = new Report();

            // Ανάκτηση και ορισμός του Project
            Integer projectId = ((Number) reportRequest.get("projectId")).intValue();
            Project project = projectService.findProjectById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            report.setProject(project);

            // Ανάκτηση του τρέχοντος χρήστη ως reporter
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User reporter = userService.findUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            report.setReporter(reporter);

            // Ορισμός περιγραφής
            report.setDescription((String) reportRequest.get("description"));

            // Ορισμός αρχικής κατάστασης
            report.setStatus(ReportStatus.PENDING);

            // Αποθήκευση και επιστροφή του report
            Report savedReport = reportService.createReport(report);
            return ResponseEntity.ok(savedReport);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<ReportDTO>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Report> updateReport(
            @PathVariable Integer id,
            @RequestBody Map<String, String> updateRequest) {
        try {
            ReportStatus status = ReportStatus.valueOf(updateRequest.get("status"));
            String adminResponse = updateRequest.get("adminResponse");

            Report updatedReport = reportService.updateReportStatus(id, status, adminResponse);

            // Create notification for the reporter
            notificationService.createNotification(
                    updatedReport.getReporter(),
                    "Your report for project '" + updatedReport.getProject().getTitle() +
                            "' status has been updated to: " + status,
                    NotificationType.REPORT_STATUS_CHANGED);

            return ResponseEntity.ok(updatedReport);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}