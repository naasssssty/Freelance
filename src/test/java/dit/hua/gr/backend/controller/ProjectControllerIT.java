package dit.hua.gr.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dit.hua.gr.backend.dto.PostProjectDTO;
import dit.hua.gr.backend.model.Project;
import dit.hua.gr.backend.model.ProjectStatus;
import dit.hua.gr.backend.model.Role;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.repository.ProjectRepository;
import dit.hua.gr.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProjectControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User client;
    private User freelancer;

    @BeforeEach
    void setUp() {
        // Clean up repositories
        projectRepository.deleteAll();
        userRepository.deleteAll();

        // Create test users
        client = new User();
        client.setUsername("testclient");
        client.setEmail("client@example.com");
        client.setPassword(passwordEncoder.encode("password"));
        client.setRole(Role.CLIENT);
        client.setVerified(true);
        userRepository.save(client);

        freelancer = new User();
        freelancer.setUsername("testfreelancer");
        freelancer.setEmail("freelancer@example.com");
        freelancer.setPassword(passwordEncoder.encode("password"));
        freelancer.setRole(Role.FREELANCER);
        freelancer.setVerified(true);
        userRepository.save(freelancer);

        // Create test projects
        Project project = new Project();
        project.setTitle("Test Project");
        project.setDescription("Test Description");
        project.setBudget(100.00);
        project.setDeadline(LocalDate.now().plusDays(30));
        project.setClient(client);
        project.setProjectStatus(ProjectStatus.APPROVED);
        projectRepository.save(project);
    }

    @Test
    @WithMockUser(username = "testfreelancer", roles = {"FREELANCER"})
    void testGetAvailableProjects() throws Exception {
        mockMvc.perform(get("/api/projects/available")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Test Project")))
                .andExpect(jsonPath("$[0].description", is("Test Description")));
    }

    @Test
    @WithMockUser(username = "testclient", roles = {"CLIENT"})
    void testPostProject() throws Exception {
        PostProjectDTO projectDTO = new PostProjectDTO();
        projectDTO.setTitle("New Project");
        projectDTO.setDescription("New Description");
        projectDTO.setBudget(150.00);
        projectDTO.setDeadline(LocalDate.now().plusDays(45));

        mockMvc.perform(post("/api/projects/post")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(projectDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("New Project")))
                .andExpect(jsonPath("$.description", is("New Description")));
    }
} 