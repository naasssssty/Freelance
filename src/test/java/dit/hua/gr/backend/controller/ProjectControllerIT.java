package dit.hua.gr.backend.controller;

import dit.hua.gr.backend.model.Project;
import dit.hua.gr.backend.model.ProjectStatus;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.repository.ProjectRepository;
import dit.hua.gr.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProjectControllerIT {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
        
        // Clean up database before each test
        projectRepository.deleteAll();
        userRepository.deleteAll();
        
        // Create test data
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@example.com");
        admin.setPassword("password");
        admin.setRole("ADMIN");
        userRepository.save(admin);
        
        User client = new User();
        client.setUsername("client");
        client.setEmail("client@example.com");
        client.setPassword("password");
        client.setRole("CLIENT");
        userRepository.save(client);
        
        Project project = new Project();
        project.setTitle("Test Project");
        project.setDescription("This is a test project");
        project.setStatus(ProjectStatus.APPROVED);
        project.setBudget(new BigDecimal("1000.00"));
        project.setDeadline(LocalDate.now().plusDays(30));
        project.setClient(client);
        projectRepository.save(project);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testGetAllProjects() throws Exception {
        mockMvc.perform(get("/api/projects")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Test Project")))
                .andExpect(jsonPath("$[0].status", is("APPROVED")));
    }

    @Test
    @WithMockUser(username = "client", roles = {"CLIENT"})
    void testCreateProject() throws Exception {
        String projectJson = "{"
                + "\"title\": \"New Project\","
                + "\"description\": \"This is a new project\","
                + "\"budget\": 2000.00,"
                + "\"deadline\": \"" + LocalDate.now().plusDays(60) + "\""
                + "}";

        mockMvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(projectJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("New Project")))
                .andExpect(jsonPath("$.status", is("PENDING")));
    }
} 