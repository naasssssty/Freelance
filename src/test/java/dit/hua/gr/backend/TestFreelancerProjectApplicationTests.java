
package dit.hua.gr.backend;

import dit.hua.gr.backend.service.*;
import dit.hua.gr.backend.repository.*;
import dit.hua.gr.backend.controller.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = BackendApplication.class)
@ActiveProfiles("test")
class TestFreelancerProjectApplicationTests {

    // Services
    @Autowired
    private UserService userService;
    
    @Autowired
    private ProjectService projectService;
    
    @Autowired
    private ApplicationService applicationService;
    
    @Autowired
    private AuthenticationService authenticationService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private JwtService jwtService;
    
    // Repositories
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    // Controllers
    @Autowired
    private AuthenticationController authenticationController;
    
    @Autowired
    private UserController userController;
    
    @Autowired
    private ProjectController projectController;
    
    @Autowired
    private ApplicationController applicationController;

    @Test
    void contextLoads() {
        // Original test - ensures Spring context loads successfully
    }
    
    @Test
    void allServicesAreInjected() {
        // Verify all critical services are properly injected
        assertNotNull(userService, "UserService should be injected");
        assertNotNull(projectService, "ProjectService should be injected");
        assertNotNull(applicationService, "ApplicationService should be injected");
        assertNotNull(authenticationService, "AuthenticationService should be injected");
        assertNotNull(notificationService, "NotificationService should be injected");
        assertNotNull(jwtService, "JwtService should be injected");
    }
    
    @Test
    void allRepositoriesAreInjected() {
        // Verify all repositories are properly injected
        assertNotNull(userRepository, "UserRepository should be injected");
        assertNotNull(projectRepository, "ProjectRepository should be injected");
        assertNotNull(applicationRepository, "ApplicationRepository should be injected");
        assertNotNull(notificationRepository, "NotificationRepository should be injected");
    }
    
    @Test
    void allControllersAreInjected() {
        // Verify all controllers are properly injected
        assertNotNull(authenticationController, "AuthenticationController should be injected");
        assertNotNull(userController, "UserController should be injected");
        assertNotNull(projectController, "ProjectController should be injected");
        assertNotNull(applicationController, "ApplicationController should be injected");
    }
    
    @Test
    void databaseConnectionWorks() {
        // Basic test to verify database connectivity
        // This will fail if database connection is broken
        long userCount = userRepository.count();
        // We expect 0 or more users (no specific assertion needed, just that it doesn't throw exception)
        assertNotNull(userCount, "Should be able to query user count from database");
    }
}

