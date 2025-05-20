package dit.hua.gr.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dit.hua.gr.backend.dto.ApplicationDTO;
import dit.hua.gr.backend.model.*;
import dit.hua.gr.backend.service.ApplicationService;
import dit.hua.gr.backend.service.NotificationService;
import dit.hua.gr.backend.service.ProjectService;
import dit.hua.gr.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ApplicationController.class)
public class ApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ApplicationService applicationService;

    @MockBean
    private ProjectService projectService;

    @MockBean
    private UserService userService;

    @MockBean
    private NotificationService notificationService;

    private Application testApplication;
    private Project testProject;
    private User testClient;
    private User testFreelancer;
    private ApplicationDTO applicationDTO;

    @BeforeEach
    void setUp() {
        testClient = new User();
        testClient.setId(1);
        testClient.setUsername("testclient");
        testClient.setEmail("client@example.com");
        testClient.setRole(Role.CLIENT);

        testFreelancer = new User();
        testFreelancer.setId(2);
        testFreelancer.setUsername("testfreelancer");
        testFreelancer.setEmail("freelancer@example.com");
        testFreelancer.setRole(Role.FREELANCER);

        testProject = new Project();
        testProject.setId(1);
        testProject.setTitle("Test Project");
        testProject.setDescription("Test Description");
        testProject.setBudget(1000.0);
        testProject.setDeadline(LocalDate.now().plusDays(30));
        testProject.setClient(testClient);
        testProject.setProjectStatus(ProjectStatus.APPROVED);
        testProject.setCreated_at(LocalDateTime.now());

        testApplication = new Application();
        testApplication.setId(1);
        testApplication.setProject(testProject);
        testApplication.setFreelancer(testFreelancer);
        testApplication.setCover_letter("Test Cover Letter");
        testApplication.setApplicationStatus(ApplicationStatus.WAITING);
        testApplication.setCreated_at(LocalDateTime.now());

        applicationDTO = new ApplicationDTO();
        applicationDTO.setId(1);
        applicationDTO.setProjectTitle("Test Project");
        applicationDTO.setProject_id(1);
        applicationDTO.setCover_letter("Test Cover Letter");
        applicationDTO.setApplicationStatus(ApplicationStatus.WAITING);
        applicationDTO.setFreelancer("testfreelancer");
        applicationDTO.setCreated_at(LocalDateTime.now().toString());
    }

    @Test
    @WithMockUser(username = "testfreelancer", roles = {"FREELANCER"})
    void applyForProject_ShouldReturnCreatedApplication() throws Exception {
        // Arrange
        when(projectService.findProjectById(1)).thenReturn(Optional.of(testProject));
        when(userService.findUserByUsername("testfreelancer")).thenReturn(Optional.of(testFreelancer));
        when(applicationService.createApplication(eq(1), eq("testfreelancer"), anyString())).thenReturn(testApplication);
        when(applicationService.convertToDTO(testApplication)).thenReturn(applicationDTO);

        // Act & Assert
        mockMvc.perform(post("/project/1/apply/testfreelancer")
                .contentType(MediaType.APPLICATION_JSON)
                .content("Test Cover Letter"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectTitle").value("Test Project"))
                .andExpect(jsonPath("$.cover_letter").value("Test Cover Letter"))
                .andExpect(jsonPath("$.applicationStatus").value("WAITING"));
    }

    @Test
    @WithMockUser(username = "testfreelancer", roles = {"FREELANCER"})
    void applyForProjectWithCV_ShouldReturnCreatedApplication() throws Exception {
        // Arrange
        MockMultipartFile cvFile = new MockMultipartFile(
                "cvFile", 
                "test-cv.pdf", 
                "application/pdf", 
                "PDF content".getBytes()
        );
        
        MockMultipartFile coverLetter = new MockMultipartFile(
                "coverLetter", 
                "", 
                "text/plain", 
                "Test Cover Letter".getBytes()
        );

        when(projectService.findProjectById(1)).thenReturn(Optional.of(testProject));
        when(userService.findUserByUsername("testfreelancer")).thenReturn(Optional.of(testFreelancer));
        when(applicationService.createApplicationWithCV(eq(1), eq("testfreelancer"), anyString(), any())).thenReturn(testApplication);
        when(applicationService.convertToDTO(testApplication)).thenReturn(applicationDTO);

        // Act & Assert
        mockMvc.perform(multipart("/project/1/apply/testfreelancer/with-cv")
                .file(cvFile)
                .file(coverLetter))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectTitle").value("Test Project"))
                .andExpect(jsonPath("$.cover_letter").value("Test Cover Letter"));
    }

    @Test
    @WithMockUser(username = "testclient", roles = {"CLIENT"})
    void getProjectApplications_ShouldReturnApplications() throws Exception {
        // Arrange
        List<Application> applications = Arrays.asList(testApplication);
        when(projectService.findProjectById(1)).thenReturn(Optional.of(testProject));
        when(userService.findUserByUsername("testclient")).thenReturn(Optional.of(testClient));
        when(applicationService.findApplicationsByProject(testProject)).thenReturn(applications);
        when(applicationService.convertToDTO(testApplication)).thenReturn(applicationDTO);

        // Act & Assert
        mockMvc.perform(get("/project/1/applications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].projectTitle").value("Test Project"))
                .andExpect(jsonPath("$[0].freelancer").value("testfreelancer"));
    }

    @Test
    @WithMockUser(username = "testfreelancer", roles = {"FREELANCER"})
    void getFreelancerApplications_ShouldReturnApplications() throws Exception {
        // Arrange
        List<Application> applications = Arrays.asList(testApplication);
        when(userService.findUserByUsername("testfreelancer")).thenReturn(Optional.of(testFreelancer));
        when(applicationService.findApplicationsByFreelancer(testFreelancer)).thenReturn(applications);
        when(applicationService.convertToDTO(testApplication)).thenReturn(applicationDTO);

        // Act & Assert
        mockMvc.perform(get("/freelancer/applications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].projectTitle").value("Test Project"))
                .andExpect(jsonPath("$[0].freelancer").value("testfreelancer"));
    }

    @Test
    @WithMockUser(username = "testclient", roles = {"CLIENT"})
    void approveApplication_ShouldReturnApprovedApplication() throws Exception {
        // Arrange
        testApplication.setApplicationStatus(ApplicationStatus.APPROVED);
        when(applicationService.getApplicationById(1)).thenReturn(Optional.of(testApplication));
        when(userService.findUserByUsername("testclient")).thenReturn(Optional.of(testClient));
        when(applicationService.approveApplication(testApplication)).thenReturn(testApplication);
        when(applicationService.convertToDTO(testApplication)).thenReturn(applicationDTO);

        // Act & Assert
        mockMvc.perform(put("/application/1/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.applicationStatus").value("APPROVED"));
    }

    @Test
    @WithMockUser(username = "testclient", roles = {"CLIENT"})
    void rejectApplication_ShouldReturnRejectedApplication() throws Exception {
        // Arrange
        testApplication.setApplicationStatus(ApplicationStatus.REJECTED);
        when(applicationService.getApplicationById(1)).thenReturn(Optional.of(testApplication));
        when(userService.findUserByUsername("testclient")).thenReturn(Optional.of(testClient));
        when(applicationService.rejectApplication(testApplication)).thenReturn(testApplication);
        when(applicationService.convertToDTO(testApplication)).thenReturn(applicationDTO);

        // Act & Assert
        mockMvc.perform(put("/application/1/reject"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.applicationStatus").value("REJECTED"));
    }
} 