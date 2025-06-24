package dit.hua.gr.backend.service;

import dit.hua.gr.backend.model.Project;
import dit.hua.gr.backend.model.ProjectStatus;
import dit.hua.gr.backend.model.Role;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private ProjectService projectService;

    private Project testProject;
    private User testClient;
    private User testFreelancer;

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
        testProject.setProjectStatus(ProjectStatus.PENDING);
    }

    @Test
    void saveProject_ShouldSaveAndReturnProject() {
        // Arrange
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // Act
        Project savedProject = projectService.saveProject(testProject);

        // Assert
        assertNotNull(savedProject);
        assertEquals(testProject.getId(), savedProject.getId());
        assertEquals(testProject.getTitle(), savedProject.getTitle());
        verify(projectRepository).save(testProject);
    }

    @Test
    void findProjectById_WhenProjectExists_ShouldReturnProject() {
        // Arrange
        when(projectRepository.findById(1)).thenReturn(Optional.of(testProject));

        // Act
        Optional<Project> foundProject = projectService.findProjectById(1);

        // Assert
        assertTrue(foundProject.isPresent());
        assertEquals(testProject.getId(), foundProject.get().getId());
        verify(projectRepository).findById(1);
    }

    @Test
    void findProjectById_WhenProjectDoesNotExist_ShouldReturnEmptyOptional() {
        // Arrange
        when(projectRepository.findById(999)).thenReturn(Optional.empty());

        // Act
        Optional<Project> foundProject = projectService.findProjectById(999);

        // Assert
        assertFalse(foundProject.isPresent());
        verify(projectRepository).findById(999);
    }

    @Test
    void findAllProjects_ShouldReturnAllProjects() {
        // Arrange
        Project project2 = new Project();
        project2.setId(2);
        project2.setTitle("Another Test Project");
        project2.setDescription("This is another test project");
        project2.setClient(testClient);
        project2.setProjectStatus(ProjectStatus.APPROVED);

        List<Project> projects = Arrays.asList(testProject, project2);
        when(projectRepository.findAllProjects()).thenReturn(projects);

        // Act
        List<Project> foundProjects = projectService.findAllProjects();

        // Assert
        assertEquals(2, foundProjects.size());
        assertEquals(testProject.getId(), foundProjects.get(0).getId());
        assertEquals(project2.getId(), foundProjects.get(1).getId());
        verify(projectRepository).findAllProjects();
    }

    @Test
    void findProjectsByFreelancer_WhenFreelancerExists_ShouldReturnProjects() {
        // Arrange
        Project project2 = new Project();
        project2.setId(2);
        project2.setTitle("Freelancer Project");
        project2.setDescription("This is a freelancer project");
        project2.setClient(testClient);
        project2.setFreelancer(testFreelancer);
        project2.setProjectStatus(ProjectStatus.IN_PROGRESS);

        List<Project> projects = Arrays.asList(project2);
        when(userService.findUserByUsername("testfreelancer")).thenReturn(Optional.of(testFreelancer));
        when(projectRepository.findProjectsByFreelancer(testFreelancer)).thenReturn(projects);

        // Act
        List<Project> foundProjects = projectService.findProjectsByFreelancer("testfreelancer");

        // Assert
        assertEquals(1, foundProjects.size());
        assertEquals(project2.getId(), foundProjects.get(0).getId());
        verify(userService).findUserByUsername("testfreelancer");
        verify(projectRepository).findProjectsByFreelancer(testFreelancer);
    }

    @Test
    void findProjectsByFreelancer_WhenFreelancerDoesNotExist_ShouldThrowException() {
        // Arrange
        when(userService.findUserByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            projectService.findProjectsByFreelancer("nonexistent");
        });

        assertEquals("Freelancer not found with username: nonexistent", exception.getMessage());
        verify(userService).findUserByUsername("nonexistent");
        verify(projectRepository, never()).findProjectsByFreelancer(any(User.class));
    }

    @Test
    void findProjectsByClient_ShouldReturnClientProjects() {
        // Arrange
        Project project2 = new Project();
        project2.setId(2);
        project2.setTitle("Client Project");
        project2.setDescription("This is a client project");
        project2.setClient(testClient);
        project2.setProjectStatus(ProjectStatus.APPROVED);

        List<Project> projects = Arrays.asList(testProject, project2);
        when(projectRepository.findByClient(testClient)).thenReturn(projects);

        // Act
        List<Project> foundProjects = projectService.findProjectsByClient(testClient);

        // Assert
        assertEquals(2, foundProjects.size());
        assertEquals(testProject.getId(), foundProjects.get(0).getId());
        assertEquals(project2.getId(), foundProjects.get(1).getId());
        verify(projectRepository).findByClient(testClient);
    }

    @Test
    void findProjectsByTitleContaining_ShouldReturnMatchingProjects() {
        // Arrange
        Project project2 = new Project();
        project2.setId(2);
        project2.setTitle("Another Test Project");
        project2.setDescription("This is another test project");
        project2.setClient(testClient);
        project2.setProjectStatus(ProjectStatus.APPROVED);

        List<Project> projects = Arrays.asList(testProject, project2);
        when(projectRepository.findByTitleContainingIgnoreCase("Test")).thenReturn(projects);

        // Act
        List<Project> foundProjects = projectService.findProjectsByTitleContaining("Test");

        // Assert
        assertEquals(2, foundProjects.size());
        assertEquals(testProject.getId(), foundProjects.get(0).getId());
        assertEquals(project2.getId(), foundProjects.get(1).getId());
        verify(projectRepository).findByTitleContainingIgnoreCase("Test");
    }

    @Test
    void updateProjectStatus_WhenProjectExists_ShouldUpdateStatus() {
        // Arrange
        when(projectRepository.findById(1)).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // Act
        Project updatedProject = projectService.updateProjectStatus(1, ProjectStatus.APPROVED);

        // Assert
        assertEquals(ProjectStatus.APPROVED, updatedProject.getProjectStatus());
        verify(projectRepository).findById(1);
        verify(projectRepository).save(testProject);
    }

    @Test
    void updateProjectStatus_WhenProjectDoesNotExist_ShouldThrowException() {
        // Arrange
        when(projectRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            projectService.updateProjectStatus(999, ProjectStatus.APPROVED);
        });

        assertEquals("Project with id 999 not found", exception.getMessage());
        verify(projectRepository).findById(999);
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    void approveProject_WhenProjectExists_ShouldApproveProject() {
        // Arrange
        when(projectRepository.findById(1)).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // Act
        Project approvedProject = projectService.approveProject(1);

        // Assert
        assertEquals(ProjectStatus.APPROVED, approvedProject.getProjectStatus());
        verify(projectRepository).findById(1);
        verify(projectRepository).save(testProject);
    }

    @Test
    void approveProject_WhenProjectDoesNotExist_ShouldThrowException() {
        // Arrange
        when(projectRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            projectService.approveProject(999);
        });

        assertEquals("Project with id 999 not found", exception.getMessage());
        verify(projectRepository).findById(999);
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    void rejectProject_WhenProjectExists_ShouldRejectProject() {
        // Arrange
        when(projectRepository.findById(1)).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        // Act
        Project rejectedProject = projectService.rejectProject(1);

        // Assert
        assertEquals(ProjectStatus.DENIED, rejectedProject.getProjectStatus());
        verify(projectRepository).findById(1);
        verify(projectRepository).save(testProject);
    }

    @Test
    void rejectProject_WhenProjectDoesNotExist_ShouldThrowException() {
        // Arrange
        when(projectRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            projectService.rejectProject(999);
        });

        assertEquals("Project with id 999 not found", exception.getMessage());
        verify(projectRepository).findById(999);
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    void findAvailableProjects_ShouldReturnApprovedProjects() {
        // Arrange
        Project project2 = new Project();
        project2.setId(2);
        project2.setTitle("Available Project");
        project2.setDescription("This is an available project");
        project2.setClient(testClient);
        project2.setProjectStatus(ProjectStatus.APPROVED);

        List<Project> projects = Arrays.asList(project2);
        when(projectRepository.findByProjectStatus(ProjectStatus.APPROVED)).thenReturn(projects);

        // Act
        List<Project> availableProjects = projectService.findAvailableProjects();

        // Assert
        assertEquals(1, availableProjects.size());
        assertEquals(project2.getId(), availableProjects.get(0).getId());
        assertEquals(ProjectStatus.APPROVED, availableProjects.get(0).getProjectStatus());
        verify(projectRepository).findByProjectStatus(ProjectStatus.APPROVED);
    }

    @Test
    void updateProject_WhenProjectExists_ShouldUpdateProject() {
        // Arrange
        Project updatedProject = new Project();
        updatedProject.setTitle("Updated Title");
        updatedProject.setDescription("Updated Description");
        updatedProject.setBudget(2000.0);
        updatedProject.setDeadline(LocalDate.now().plusDays(60));
        updatedProject.setClient(testClient);

        when(projectRepository.findById(1)).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Project result = projectService.updateProject(1, updatedProject);

        // Assert
        assertEquals("Updated Title", result.getTitle());
        assertEquals("Updated Description", result.getDescription());
        assertEquals(2000.0, result.getBudget());
        assertEquals(updatedProject.getDeadline(), result.getDeadline());
        verify(projectRepository).findById(1);
        verify(projectRepository).save(testProject);
    }

    @Test
    void updateProject_WhenProjectDoesNotExist_ShouldThrowException() {
        // Arrange
        Project updatedProject = new Project();
        updatedProject.setTitle("Updated Title");
        updatedProject.setDescription("Updated Description");

        when(projectRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            projectService.updateProject(999, updatedProject);
        });

        assertEquals("Project with id 999 not found", exception.getMessage());
        verify(projectRepository).findById(999);
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    void deleteProject_WhenProjectExists_ShouldDeleteProject() {
        // Arrange
        when(projectRepository.existsById(1)).thenReturn(true);
        doNothing().when(projectRepository).deleteById(1);

        // Act
        projectService.deleteProject(1);

        // Assert
        verify(projectRepository).existsById(1);
        verify(projectRepository).deleteById(1);
    }

    @Test
    void deleteProject_WhenProjectDoesNotExist_ShouldThrowException() {
        // Arrange
        when(projectRepository.existsById(999)).thenReturn(false);

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            projectService.deleteProject(999);
        });

        assertEquals("Project with id 999 not found", exception.getMessage());
        verify(projectRepository).existsById(999);
        verify(projectRepository, never()).deleteById(anyInt());
    }
} 