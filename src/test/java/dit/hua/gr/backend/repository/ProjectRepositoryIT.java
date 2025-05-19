package dit.hua.gr.backend.repository;

import dit.hua.gr.backend.model.Project;
import dit.hua.gr.backend.model.ProjectStatus;
import dit.hua.gr.backend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

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

    @Autowired
    private UserRepository userRepository;

    @Test
    void testFindByStatus() {
        // Arrange
        User client = new User();
        client.setUsername("testclient");
        client.setEmail("client@example.com");
        client.setPassword("password");
        entityManager.persist(client);

        Project project1 = new Project();
        project1.setTitle("Approved Project");
        project1.setDescription("This is an approved project");
        project1.setStatus(ProjectStatus.APPROVED);
        project1.setClient(client);
        entityManager.persist(project1);

        Project project2 = new Project();
        project2.setTitle("Pending Project");
        project2.setDescription("This is a pending project");
        project2.setStatus(ProjectStatus.PENDING);
        project2.setClient(client);
        entityManager.persist(project2);

        entityManager.flush();

        // Act
        List<Project> approvedProjects = projectRepository.findByStatus(ProjectStatus.APPROVED);
        List<Project> pendingProjects = projectRepository.findByStatus(ProjectStatus.PENDING);

        // Assert
        assertEquals(1, approvedProjects.size());
        assertEquals("Approved Project", approvedProjects.get(0).getTitle());
        
        assertEquals(1, pendingProjects.size());
        assertEquals("Pending Project", pendingProjects.get(0).getTitle());
    }

    @Test
    void testFindByClient() {
        // Arrange
        User client1 = new User();
        client1.setUsername("client1");
        client1.setEmail("client1@example.com");
        client1.setPassword("password");
        entityManager.persist(client1);

        User client2 = new User();
        client2.setUsername("client2");
        client2.setEmail("client2@example.com");
        client2.setPassword("password");
        entityManager.persist(client2);

        Project project1 = new Project();
        project1.setTitle("Client 1 Project");
        project1.setDescription("This is client 1's project");
        project1.setStatus(ProjectStatus.APPROVED);
        project1.setClient(client1);
        entityManager.persist(project1);

        Project project2 = new Project();
        project2.setTitle("Client 2 Project");
        project2.setDescription("This is client 2's project");
        project2.setStatus(ProjectStatus.APPROVED);
        project2.setClient(client2);
        entityManager.persist(project2);

        entityManager.flush();

        // Act
        List<Project> client1Projects = projectRepository.findByClient(client1);
        List<Project> client2Projects = projectRepository.findByClient(client2);

        // Assert
        assertEquals(1, client1Projects.size());
        assertEquals("Client 1 Project", client1Projects.get(0).getTitle());
        
        assertEquals(1, client2Projects.size());
        assertEquals("Client 2 Project", client2Projects.get(0).getTitle());
    }
} 