package dit.hua.gr.backend.controller;

import dit.hua.gr.backend.model.Project;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.service.ProjectService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

class ProjectControllerTest {

    @Mock
    private ProjectService projectService;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private ProjectController projectController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void testGetAllProjects() {
        // Arrange
        Project project1 = new Project();
        project1.setId(1L);
        project1.setTitle("Project 1");
        
        Project project2 = new Project();
        project2.setId(2L);
        project2.setTitle("Project 2");
        
        List<Project> projects = Arrays.asList(project1, project2);
        
        when(projectService.findAll()).thenReturn(projects);

        // Act
        ResponseEntity<List<Project>> response = projectController.getAllProjects();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals("Project 1", response.getBody().get(0).getTitle());
        assertEquals("Project 2", response.getBody().get(1).getTitle());
        verify(projectService, times(1)).findAll();
    }

    @Test
    void testCreateProject() {
        // Arrange
        User currentUser = new User();
        currentUser.setId(1L);
        currentUser.setUsername("client");
        
        Project newProject = new Project();
        newProject.setTitle("New Project");
        newProject.setDescription("Project Description");
        
        Project savedProject = new Project();
        savedProject.setId(1L);
        savedProject.setTitle("New Project");
        savedProject.setDescription("Project Description");
        savedProject.setClient(currentUser);
        
        when(authentication.getPrincipal()).thenReturn(currentUser);
        when(projectService.save(any(Project.class))).thenReturn(savedProject);

        // Act
        ResponseEntity<Project> response = projectController.createProject(newProject);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().getId());
        assertEquals("New Project", response.getBody().getTitle());
        assertEquals(currentUser, response.getBody().getClient());
        verify(projectService, times(1)).save(any(Project.class));
    }
} 