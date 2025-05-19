package dit.hua.gr.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dit.hua.gr.backend.dto.PostProjectDTO;
import dit.hua.gr.backend.model.Project;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.service.NotificationService;
import dit.hua.gr.backend.service.ProjectService;
import dit.hua.gr.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ProjectControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ProjectService projectService;

    @Mock
    private UserService userService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ProjectController projectController;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders
                .standaloneSetup(projectController)
                .build();
        
        // Configure ObjectMapper for LocalDate
        objectMapper.findAndRegisterModules();
    }

    @Test
    void testGetAvailableProjects() throws Exception {
        // Arrange
        Project project1 = new Project();
        project1.setId(1);
        project1.setTitle("Project 1");
        project1.setDescription("Description 1");
        project1.setBudget(100.0);
        project1.setDeadline(LocalDate.now().plusDays(10));

        Project project2 = new Project();
        project2.setId(2);
        project2.setTitle("Project 2");
        project2.setDescription("Description 2");
        project2.setBudget(200.0);
        project2.setDeadline(LocalDate.now().plusDays(20));

        List<Project> projects = Arrays.asList(project1, project2);
        when(projectService.findAvailableProjects()).thenReturn(projects);

        // Act & Assert - Δοκιμάζουμε διαφορετικά endpoints
        mockMvc.perform(get("/api/project/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Project 1"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].title").value("Project 2"));
    }

    @Test
    void testPostProject() throws Exception {
        // Arrange
        PostProjectDTO projectDTO = new PostProjectDTO();
        projectDTO.setTitle("New Project");
        projectDTO.setDescription("New Description");
        projectDTO.setBudget(300.0);
        projectDTO.setDeadline(LocalDate.now().plusDays(30));

        User client = new User();
        client.setId(1);
        client.setUsername("client1");

        Project savedProject = new Project();
        savedProject.setId(3);
        savedProject.setTitle("New Project");
        savedProject.setDescription("New Description");
        savedProject.setBudget(300.0);
        savedProject.setDeadline(LocalDate.now().plusDays(30));
        savedProject.setClient(client);

        when(authentication.getName()).thenReturn("client1");
        when(userService.findUserByUsername("client1")).thenReturn(Optional.of(client));
        when(projectService.saveProject(any(Project.class))).thenReturn(savedProject);

        // Act & Assert - Δοκιμάζουμε διαφορετικά endpoints
        mockMvc.perform(post("/api/project/post")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(projectDTO))
                .principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.title").value("New Project"));
    }
} 