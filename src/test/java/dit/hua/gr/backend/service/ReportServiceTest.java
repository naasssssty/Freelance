package dit.hua.gr.backend.service;

import dit.hua.gr.backend.dto.ReportDTO;
import dit.hua.gr.backend.model.*;
import dit.hua.gr.backend.repository.ReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @InjectMocks
    private ReportService reportService;

    private Report testReport;
    private User testReporter;
    private Project testProject;

    @BeforeEach
    void setUp() {
        // Δημιουργία test user (reporter)
        testReporter = new User();
        testReporter.setId(1);
        testReporter.setUsername("testreporter");
        testReporter.setEmail("reporter@test.com");
        testReporter.setPassword("password");
        testReporter.setRole(Role.FREELANCER);
        testReporter.setVerified(true);

        // Δημιουργία test project
        testProject = new Project();
        testProject.setId(1);
        testProject.setTitle("Test Project");
        testProject.setDescription("This is a test project");
        testProject.setProjectStatus(ProjectStatus.IN_PROGRESS);

        // Δημιουργία test report
        testReport = new Report();
        testReport.setId(1);
        testReport.setProject(testProject);
        testReport.setReporter(testReporter);
        testReport.setDescription("This is a test report");
        testReport.setStatus(ReportStatus.PENDING);
        testReport.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void createReport_ShouldSaveAndReturnReport() {
        // Arrange
        when(reportRepository.save(any(Report.class))).thenReturn(testReport);

        // Act
        Report savedReport = reportService.createReport(testReport);

        // Assert
        assertNotNull(savedReport);
        assertEquals(testReport.getId(), savedReport.getId());
        assertEquals(testReport.getDescription(), savedReport.getDescription());
        assertEquals(testReport.getStatus(), savedReport.getStatus());
        verify(reportRepository, times(1)).save(testReport);
    }

    @Test
    void getAllReports_ShouldReturnAllReportsAsDTO() {
        // Arrange
        Report report2 = new Report();
        report2.setId(2);
        report2.setProject(testProject);
        report2.setReporter(testReporter);
        report2.setDescription("Another test report");
        report2.setStatus(ReportStatus.IN_REVIEW);
        report2.setCreatedAt(LocalDateTime.now());

        List<Report> reports = Arrays.asList(testReport, report2);
        when(reportRepository.findAll()).thenReturn(reports);

        // Act
        List<ReportDTO> reportDTOs = reportService.getAllReports();

        // Assert
        assertEquals(2, reportDTOs.size());
        assertEquals(testReport.getId(), reportDTOs.get(0).getId());
        assertEquals(testReport.getDescription(), reportDTOs.get(0).getDescription());
        assertEquals(testReport.getStatus(), reportDTOs.get(0).getStatus());
        assertEquals(report2.getId(), reportDTOs.get(1).getId());
        assertEquals(report2.getDescription(), reportDTOs.get(1).getDescription());
        assertEquals(report2.getStatus(), reportDTOs.get(1).getStatus());
        verify(reportRepository, times(1)).findAll();
    }

    @Test
    void updateReportStatus_WhenReportExists_ShouldUpdateStatusAndReturnReport() {
        // Arrange
        when(reportRepository.findById(1)).thenReturn(Optional.of(testReport));
        when(reportRepository.save(any(Report.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Report updatedReport = reportService.updateReportStatus(1, ReportStatus.RESOLVED, "Issue has been resolved");

        // Assert
        assertEquals(ReportStatus.RESOLVED, updatedReport.getStatus());
        assertEquals("Issue has been resolved", updatedReport.getAdminResponse());
        verify(reportRepository).findById(1);
        verify(reportRepository).save(testReport);
    }

    @Test
    void updateReportStatus_WhenReportDoesNotExist_ShouldThrowException() {
        // Arrange
        when(reportRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            reportService.updateReportStatus(999, ReportStatus.RESOLVED, "Issue has been resolved");
        });

        assertEquals("Report not found", exception.getMessage());
        verify(reportRepository).findById(999);
        verify(reportRepository, never()).save(any(Report.class));
    }

    @Test
    void updateReportStatus_WithNullAdminResponse_ShouldNotUpdateAdminResponse() {
        // Arrange
        testReport.setAdminResponse("Previous response");
        when(reportRepository.findById(1)).thenReturn(Optional.of(testReport));
        when(reportRepository.save(any(Report.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Report updatedReport = reportService.updateReportStatus(1, ReportStatus.RESOLVED, null);

        // Assert
        assertEquals(ReportStatus.RESOLVED, updatedReport.getStatus());
        assertEquals("Previous response", updatedReport.getAdminResponse());
        verify(reportRepository).findById(1);
        verify(reportRepository).save(testReport);
    }

    @Test
    void updateReportStatus_WithEmptyAdminResponse_ShouldNotUpdateAdminResponse() {
        // Arrange
        testReport.setAdminResponse("Previous response");
        when(reportRepository.findById(1)).thenReturn(Optional.of(testReport));
        when(reportRepository.save(any(Report.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Report updatedReport = reportService.updateReportStatus(1, ReportStatus.RESOLVED, "  ");

        // Assert
        assertEquals(ReportStatus.RESOLVED, updatedReport.getStatus());
        assertEquals("Previous response", updatedReport.getAdminResponse());
        verify(reportRepository).findById(1);
        verify(reportRepository).save(testReport);
    }

    @Test
    void convertToDTO_ShouldConvertReportToDTO() {
        // Arrange - Χρησιμοποιούμε private μέθοδο μέσω reflection
        java.lang.reflect.Method method;
        try {
            method = ReportService.class.getDeclaredMethod("convertToDTO", Report.class);
            method.setAccessible(true);

            // Act
            ReportDTO dto = (ReportDTO) method.invoke(reportService, testReport);

            // Assert
            assertEquals(testReport.getId(), dto.getId());
            assertEquals(testReport.getProjectTitle(), dto.getProjectTitle());
            assertEquals(testReport.getReporterUsername(), dto.getReporterUsername());
            assertEquals(testReport.getDescription(), dto.getDescription());
            assertEquals(testReport.getStatus(), dto.getStatus());
            assertEquals(testReport.getCreatedAt(), dto.getCreatedAt());
            assertEquals(testReport.getAdminResponse(), dto.getAdminResponse());
        } catch (Exception e) {
            fail("Exception thrown while testing convertToDTO: " + e.getMessage());
        }
    }
} 