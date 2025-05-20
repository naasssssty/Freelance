package dit.hua.gr.backend.service;

import dit.hua.gr.backend.dto.ApplicationDTO;
import dit.hua.gr.backend.model.*;
import dit.hua.gr.backend.repository.ApplicationRepository;
import dit.hua.gr.backend.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserService userService;

    @Mock
    private ProjectService projectService;

    @InjectMocks
    private ApplicationService applicationService;

    private User testClient;
    private User testFreelancer;
    private Project testProject;
    private Application testApplication;

    @BeforeEach
    void setUp() {
        // Δημιουργία test client
        testClient = new User();
        testClient.setId(1);
        testClient.setUsername("testclient");
        testClient.setEmail("client@test.com");
        testClient.setPassword("password");
        testClient.setRole(Role.CLIENT);
        testClient.setVerified(true);

        // Δημιουργία test freelancer
        testFreelancer = new User();
        testFreelancer.setId(2);
        testFreelancer.setUsername("testfreelancer");
        testFreelancer.setEmail("freelancer@test.com");
        testFreelancer.setPassword("password");
        testFreelancer.setRole(Role.FREELANCER);
        testFreelancer.setVerified(true);

        // Δημιουργία test project
        testProject = new Project();
        testProject.setId(1);
        testProject.setTitle("Test Project");
        testProject.setDescription("This is a test project");
        testProject.setBudget(1000.0);
        testProject.setDeadline(LocalDate.now().plusDays(30));
        testProject.setCreated_at(LocalDateTime.now());
        testProject.setClient(testClient);
        testProject.setProjectStatus(ProjectStatus.APPROVED);

        // Δημιουργία test application
        testApplication = new Application();
        testApplication.setId(1);
        testApplication.setProject(testProject);
        testApplication.setFreelancer(testFreelancer);
        testApplication.setCover_letter("I am interested in this project");
        testApplication.setCreated_at(LocalDateTime.now());
        testApplication.setApplicationStatus(ApplicationStatus.WAITING);
    }

    @Test
    void createApplication_ShouldCreateAndReturnApplication() {
        // Arrange
        when(projectService.findProjectById(1)).thenReturn(Optional.of(testProject));
        when(userService.findUserByUsername("testfreelancer")).thenReturn(Optional.of(testFreelancer));
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        // Act
        Application result = applicationService.createApplication(1, "testfreelancer", "I am interested in this project");

        // Assert
        assertNotNull(result);
        assertEquals(testApplication.getId(), result.getId());
        assertEquals(testApplication.getProject().getId(), result.getProject().getId());
        assertEquals(testApplication.getFreelancer().getId(), result.getFreelancer().getId());
        assertEquals(testApplication.getCover_letter(), result.getCover_letter());
        assertEquals(ApplicationStatus.WAITING, result.getApplicationStatus());
        verify(projectService).findProjectById(1);
        verify(userService).findUserByUsername("testfreelancer");
        verify(applicationRepository).save(any(Application.class));
    }

    @Test
    void createApplication_WhenProjectNotFound_ShouldThrowException() {
        // Arrange
        when(projectService.findProjectById(999)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            applicationService.createApplication(999, "testfreelancer", "I am interested in this project");
        });

        assertEquals("Project not found with ID: 999", exception.getMessage());
        verify(projectService).findProjectById(999);
        verify(userService, never()).findUserByUsername(anyString());
        verify(applicationRepository, never()).save(any(Application.class));
    }

    @Test
    void createApplication_WhenFreelancerNotFound_ShouldThrowException() {
        // Arrange
        when(projectService.findProjectById(1)).thenReturn(Optional.of(testProject));
        when(userService.findUserByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            applicationService.createApplication(1, "nonexistent", "I am interested in this project");
        });

        assertEquals("Freelancer not found with username: nonexistent", exception.getMessage());
        verify(projectService).findProjectById(1);
        verify(userService).findUserByUsername("nonexistent");
        verify(applicationRepository, never()).save(any(Application.class));
    }

    @Test
    void createApplicationWithCV_ShouldCreateAndReturnApplication() {
        // Arrange
        when(projectService.findProjectById(1)).thenReturn(Optional.of(testProject));
        when(userService.findUserByUsername("testfreelancer")).thenReturn(Optional.of(testFreelancer));
        
        Application applicationWithCV = new Application();
        applicationWithCV.setId(1);
        applicationWithCV.setProject(testProject);
        applicationWithCV.setFreelancer(testFreelancer);
        applicationWithCV.setCover_letter("I am interested in this project");
        applicationWithCV.setCreated_at(LocalDateTime.now());
        applicationWithCV.setApplicationStatus(ApplicationStatus.WAITING);
        applicationWithCV.setCvFilePath("/uploads/cv.pdf");
        
        when(applicationRepository.save(any(Application.class))).thenReturn(applicationWithCV);

        // Act
        Application result = applicationService.createApplicationWithCV(1, "testfreelancer", 
                "I am interested in this project", "/uploads/cv.pdf");

        // Assert
        assertNotNull(result);
        assertEquals(applicationWithCV.getId(), result.getId());
        assertEquals(applicationWithCV.getProject().getId(), result.getProject().getId());
        assertEquals(applicationWithCV.getFreelancer().getId(), result.getFreelancer().getId());
        assertEquals(applicationWithCV.getCover_letter(), result.getCover_letter());
        assertEquals(applicationWithCV.getCvFilePath(), result.getCvFilePath());
        assertEquals(ApplicationStatus.WAITING, result.getApplicationStatus());
        verify(projectService).findProjectById(1);
        verify(userService).findUserByUsername("testfreelancer");
        verify(applicationRepository).save(any(Application.class));
    }

    @Test
    void getApplicationsByClient_ShouldReturnClientApplications() {
        // Arrange
        List<Application> applications = Arrays.asList(testApplication);
        when(userService.findUserByUsername("testclient")).thenReturn(Optional.of(testClient));
        when(applicationRepository.findByClient(1)).thenReturn(applications);

        // Act
        List<Application> result = applicationService.getApplicationsByClient(testClient);

        // Assert
        assertEquals(1, result.size());
        assertEquals(testApplication.getId(), result.get(0).getId());
        verify(userService).findUserByUsername("testclient");
        verify(applicationRepository).findByClient(1);
    }

    @Test
    void getApplicationsByClient_WhenClientNotFound_ShouldThrowException() {
        // Arrange
        User nonExistentClient = new User();
        nonExistentClient.setUsername("nonexistent");
        when(userService.findUserByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            applicationService.getApplicationsByClient(nonExistentClient);
        });

        assertEquals("Client not found with username: nonexistent", exception.getMessage());
        verify(userService).findUserByUsername("nonexistent");
        verify(applicationRepository, never()).findByClient(anyInt());
    }

    @Test
    void getApplicationsByFreelancer_ShouldReturnFreelancerApplications() {
        // Arrange
        List<Application> applications = Arrays.asList(testApplication);
        when(applicationRepository.findByFreelancer(testFreelancer)).thenReturn(applications);

        // Act
        List<Application> result = applicationService.getApplicationsByFreelancer(testFreelancer);

        // Assert
        assertEquals(1, result.size());
        assertEquals(testApplication.getId(), result.get(0).getId());
        verify(applicationRepository).findByFreelancer(testFreelancer);
    }

    @Test
    void getApplicationsByProject_ShouldReturnProjectApplications() {
        // Arrange
        List<Application> applications = Arrays.asList(testApplication);
        when(applicationRepository.findByProject(testProject)).thenReturn(applications);

        // Act
        List<Application> result = applicationService.getApplicationsByProject(testProject);

        // Assert
        assertEquals(1, result.size());
        assertEquals(testApplication.getId(), result.get(0).getId());
        verify(applicationRepository).findByProject(testProject);
    }

    @Test
    void getApplicationsByStatus_ShouldReturnApplicationsWithSpecificStatus() {
        // Arrange
        List<Application> applications = Arrays.asList(testApplication);
        when(applicationRepository.findByApplicationStatus(ApplicationStatus.WAITING)).thenReturn(applications);

        // Act
        List<Application> result = applicationService.getApplicationsByStatus(ApplicationStatus.WAITING);

        // Assert
        assertEquals(1, result.size());
        assertEquals(ApplicationStatus.WAITING, result.get(0).getApplicationStatus());
        verify(applicationRepository).findByApplicationStatus(ApplicationStatus.WAITING);
    }

    @Test
    void getApplicationByProjectAndFreelancer_ShouldReturnApplication() {
        // Arrange
        when(applicationRepository.findByProjectAndFreelancer(testProject, testFreelancer))
                .thenReturn(Optional.of(testApplication));

        // Act
        Optional<Application> result = applicationService.getApplicationByProjectAndFreelancer(testProject, testFreelancer);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testApplication.getId(), result.get().getId());
        verify(applicationRepository).findByProjectAndFreelancer(testProject, testFreelancer);
    }

    @Test
    void updateApplicationStatus_ShouldUpdateAndReturnApplication() {
        // Arrange
        Application updatedApplication = new Application();
        updatedApplication.setId(1);
        updatedApplication.setApplicationStatus(ApplicationStatus.APPROVED);
        
        when(applicationRepository.findById(1)).thenReturn(Optional.of(testApplication));
        when(applicationRepository.save(any(Application.class))).thenReturn(updatedApplication);

        // Act
        Application result = applicationService.updateApplicationStatus(1, ApplicationStatus.APPROVED);

        // Assert
        assertEquals(ApplicationStatus.APPROVED, result.getApplicationStatus());
        verify(applicationRepository).findById(1);
        verify(applicationRepository).save(any(Application.class));
    }

    @Test
    void updateApplicationStatus_WhenApplicationNotFound_ShouldThrowException() {
        // Arrange
        when(applicationRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            applicationService.updateApplicationStatus(999, ApplicationStatus.APPROVED);
        });

        assertEquals("Application not found with ID: 999", exception.getMessage());
        verify(applicationRepository).findById(999);
        verify(applicationRepository, never()).save(any(Application.class));
    }

    @Test
    void acceptApplication_ShouldAcceptApplicationAndRejectOthers() {
        // Arrange
        Application application1 = testApplication; // This is the one we'll accept
        
        Application application2 = new Application();
        application2.setId(2);
        application2.setProject(testProject);
        application2.setFreelancer(new User());
        application2.setApplicationStatus(ApplicationStatus.WAITING);
        
        List<Application> allApplications = Arrays.asList(application1, application2);
        
        when(applicationRepository.findById(1)).thenReturn(Optional.of(application1));
        when(applicationRepository.findByProject(testProject)).thenReturn(allApplications);
        when(applicationRepository.save(any(Application.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // Act
        Application result = applicationService.acceptApplication(1);

        // Assert
        assertEquals(ApplicationStatus.APPROVED, result.getApplicationStatus());
        verify(applicationRepository).findById(1);
        verify(applicationRepository).findByProject(testProject);
        verify(applicationRepository, times(3)).save(any(Application.class)); // Once for accepting, once for each rejection
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void acceptApplication_WhenApplicationNotFound_ShouldThrowException() {
        // Arrange
        when(applicationRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            applicationService.acceptApplication(999);
        });

        assertEquals("Application not found with ID: 999", exception.getMessage());
        verify(applicationRepository).findById(999);
        verify(applicationRepository, never()).save(any(Application.class));
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    void deleteApplication_WhenApplicationExists_ShouldDeleteApplication() {
        // Arrange
        when(applicationRepository.existsById(1)).thenReturn(true);
        doNothing().when(applicationRepository).deleteById(1);

        // Act
        applicationService.deleteApplication(1);

        // Assert
        verify(applicationRepository).existsById(1);
        verify(applicationRepository).deleteById(1);
    }

    @Test
    void deleteApplication_WhenApplicationDoesNotExist_ShouldThrowException() {
        // Arrange
        when(applicationRepository.existsById(999)).thenReturn(false);

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            applicationService.deleteApplication(999);
        });

        assertEquals("Application not found with ID: 999", exception.getMessage());
        verify(applicationRepository).existsById(999);
        verify(applicationRepository, never()).deleteById(anyInt());
    }

    @Test
    void getApplicationById_WhenApplicationExists_ShouldReturnApplication() {
        // Arrange
        when(applicationRepository.findById(1)).thenReturn(Optional.of(testApplication));

        // Act
        Optional<Application> result = applicationService.getApplicationById(1);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testApplication.getId(), result.get().getId());
        verify(applicationRepository).findById(1);
    }

    @Test
    void getApplicationById_WhenApplicationDoesNotExist_ShouldReturnEmptyOptional() {
        // Arrange
        when(applicationRepository.findById(999)).thenReturn(Optional.empty());

        // Act
        Optional<Application> result = applicationService.getApplicationById(999);

        // Assert
        assertFalse(result.isPresent());
        verify(applicationRepository).findById(999);
    }

    @Test
    void convertToDTO_ShouldConvertApplicationToDTO() {
        // Act
        ApplicationDTO dto = applicationService.convertToDTO(testApplication);

        // Assert
        assertEquals(testApplication.getId(), dto.getId());
        assertEquals(testApplication.getProject().getTitle(), dto.getProjectTitle());
        assertEquals(testApplication.getProject().getId(), dto.getProject_id());
        assertEquals(testApplication.getCover_letter(), dto.getCover_letter());
        assertEquals(testApplication.getApplicationStatus(), dto.getApplicationStatus());
        assertEquals(testApplication.getFreelancer().getUsername(), dto.getFreelancer());
        assertEquals(testApplication.getCreated_at().format(DateTimeFormatter.ISO_DATE_TIME), dto.getCreated_at());
    }
} 