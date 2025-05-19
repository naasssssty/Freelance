package dit.hua.gr.backend.repository;

import dit.hua.gr.backend.model.Project;
import dit.hua.gr.backend.model.ProjectStatus;
import dit.hua.gr.backend.model.Role;
import dit.hua.gr.backend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@DataJpaTest
@ActiveProfiles("test")
class ProjectRepositoryIT {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ProjectRepository projectRepository;

    @Test
    void testFindByProjectStatus() {
        // Arrange
        User client = new User();
        client.setUsername("testclient");
        client.setEmail("client@example.com");
        client.setPassword("password");
        client.setRole(Role.CLIENT);
        entityManager.persist(client);
        
        Project project1 = new Project();
        project1.setTitle("Project 1");
        project1.setDescription("Description 1");
        project1.setBudget(100.00);
        project1.setDeadline(LocalDate.now().plusDays(30));
        project1.setClient(client);
        project1.setProjectStatus(ProjectStatus.APPROVED);
        entityManager.persist(project1);
        
        Project project2 = new Project();
        project2.setTitle("Project 2");
        project2.setDescription("Description 2");
        project2.setBudget(200.00);
        project2.setDeadline(LocalDate.now().plusDays(60));
        project2.setClient(client);
        project2.setProjectStatus(ProjectStatus.PENDING);
        entityManager.persist(project2);
        
        entityManager.flush();

        // Act
        List<Project> approvedProjects = projectRepository.findByProjectStatus(ProjectStatus.APPROVED);
        List<Project> pendingProjects = projectRepository.findByProjectStatus(ProjectStatus.PENDING);

        // Assert
        assertEquals(1, approvedProjects.size());
        assertEquals("Project 1", approvedProjects.get(0).getTitle());
        
        assertEquals(1, pendingProjects.size());
        assertEquals("Project 2", pendingProjects.get(0).getTitle());
    }

    @Test
    void testSaveProject() {
        // Arrange
        User client = new User();
        client.setUsername("testclient2");
        client.setEmail("client2@example.com");
        client.setPassword("password");
        client.setRole(Role.CLIENT);
        entityManager.persist(client);
        
        Project project = new Project();
        project.setTitle("New Project");
        project.setDescription("New Description");
        project.setBudget(150.00);
        project.setDeadline(LocalDate.now().plusDays(45));
        project.setClient(client);
        project.setProjectStatus(ProjectStatus.PENDING);

        // Act
        Project savedProject = projectRepository.save(project);
        
        // Assert
        assertNotNull(savedProject.getId());
        assertEquals("New Project", savedProject.getTitle());
        assertEquals("New Description", savedProject.getDescription());
        assertEquals(150.00, savedProject.getBudget());
        assertEquals(ProjectStatus.PENDING, savedProject.getProjectStatus());
    }
} 