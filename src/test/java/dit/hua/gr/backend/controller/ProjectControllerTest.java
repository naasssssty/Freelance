package dit.hua.gr.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dit.hua.gr.backend.dto.PostProjectDTO;
import dit.hua.gr.backend.dto.ProjectResponseDTO;
import dit.hua.gr.backend.model.Project;
import dit.hua.gr.backend.model.ProjectStatus;
import dit.hua.gr.backend.model.Role;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.service.NotificationService;
import dit.hua.gr.backend.service.ProjectService;
import dit.hua.gr.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProjectController.class)
public class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProjectService projectService;

    @MockBean
    private UserService userService;

    @MockBean
    private NotificationService notificationService;

    private Project testProject;
    private User testUser;
    private PostProjectDTO postProjectDTO;
    private ProjectResponseDTO projectResponseDTO;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1);
        testUser.setUsername("testclient");
        testUser.setEmail("client@example.com");
        testUser.setRole(Role.CLIENT);

        testProject = new Project();
        testProject.setId(1);
        testProject.setTitle("Test Project");
        testProject.setDescription("Test Description");
        testProject.setBudget(1000.0);
        testProject.setDeadline(LocalDate.now().plusDays(30));
        testProject.setClient(testUser);
        testProject.setProjectStatus(ProjectStatus.PENDING);
        testProject.setCreated_at(LocalDateTime.now());

        postProjectDTO = new PostProjectDTO();
        postProjectDTO.setTitle("Test Project");
        postProjectDTO.setDescription("Test Description");
        postProjectDTO.setBudget(1000.0);
        postProjectDTO.setDeadline(LocalDate.now().plusDays(30));
        postProjectDTO.setClientUsername("testclient");

        projectResponseDTO = new ProjectResponseDTO(
                1,
                "Test Project",
                "Test Description",
                1000.0,
                LocalDate.now().plusDays(30),
                "testclient",
                ProjectStatus.PENDING,
                LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)
        );
    }

    @Test
    @WithMockUser(username = "testclient", roles = {"CLIENT"})
    void postProject_ShouldReturnCreatedProject() throws Exception {
        // Arrange
        when(userService.findUserByUsername("testclient")).thenReturn(Optional.of(testUser));
        when(projectService.saveProject(any(Project.class))).thenReturn(testProject);

        // Act & Assert
        mockMvc.perform(post("/project/post")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(postProjectDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Project"))
                .andExpect(jsonPath("$.description").value("Test Description"))
                .andExpect(jsonPath("$.budget").value(1000.0));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getAllProjects_ShouldReturnAllProjects() throws Exception {
        // Arrange
        List<Project> projects = Arrays.asList(testProject);
        when(projectService.findAllProjects()).thenReturn(projects);

        // Act & Assert
        mockMvc.perform(get("/project/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Test Project"));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void approveProject_ShouldReturnApprovedProject() throws Exception {
        // Arrange
        testProject.setProjectStatus(ProjectStatus.APPROVED);
        when(projectService.approveProject(1)).thenReturn(testProject);

        // Act & Assert
        mockMvc.perform(put("/project/1/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectStatus").value("APPROVED"));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void denyProject_ShouldReturnDeniedProject() throws Exception {
        // Arrange
        testProject.setProjectStatus(ProjectStatus.DENIED);
        when(projectService.rejectProject(1)).thenReturn(testProject);

        // Act & Assert
        mockMvc.perform(put("/project/1/deny"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectStatus").value("DENIED"));
    }

    @Test
    @WithMockUser(roles = {"FREELANCER"})
    void getAvailableProjects_ShouldReturnAvailableProjects() throws Exception {
        // Arrange
        List<Project> projects = Arrays.asList(testProject);
        when(projectService.findAvailableProjects()).thenReturn(projects);

        // Act & Assert
        mockMvc.perform(get("/project/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Test Project"));
    }

    @Test
    @WithMockUser(username = "testclient", roles = {"CLIENT"})
    void getClientProjects_ShouldReturnClientProjects() throws Exception {
        // Arrange
        List<Project> projects = Arrays.asList(testProject);
        when(userService.findUserByUsername("testclient")).thenReturn(Optional.of(testUser));
        when(projectService.findProjectsByClient(testUser)).thenReturn(projects);

        // Act & Assert
        mockMvc.perform(get("/project/client"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Test Project"));
    }

    @Test
    @WithMockUser(roles = {"CLIENT", "ADMIN"})
    void updateProject_ShouldReturnUpdatedProject() throws Exception {
        // Arrange
        testProject.setTitle("Updated Project");
        when(projectService.updateProject(eq(1), any(Project.class))).thenReturn(testProject);

        // Act & Assert
        mockMvc.perform(put("/project/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testProject)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Project"));
    }

    @Test
    @WithMockUser(roles = {"CLIENT", "ADMIN"})
    void deleteProject_ShouldReturnNoContent() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/project/1"))
                .andExpect(status().isNoContent());
    }
} 