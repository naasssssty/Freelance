package dit.hua.gr.backend.service;

import dit.hua.gr.backend.dto.ReportDTO;
import dit.hua.gr.backend.model.Report;
import dit.hua.gr.backend.model.ReportStatus;
import dit.hua.gr.backend.repository.ReportRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {
    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public Report createReport(Report report) {
        return reportRepository.save(report);
    }

    public List<ReportDTO> getAllReports() {
        return reportRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public Report updateReportStatus(Integer reportId, ReportStatus status, String adminResponse) {
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new RuntimeException("Report not found"));
        
        report.setStatus(status);
        if (adminResponse != null && !adminResponse.trim().isEmpty()) {
            report.setAdminResponse(adminResponse);
        }
        
        return reportRepository.save(report);
    }

    private ReportDTO convertToDTO(Report report) {
        return new ReportDTO(
            report.getId(),
            report.getProjectTitle(),
            report.getReporterUsername(),
            report.getDescription(),
            report.getStatus(),
            report.getCreatedAt(),
            report.getAdminResponse()
        );
    }
} 