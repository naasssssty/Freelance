package dit.hua.gr.backend.controller;

import dit.hua.gr.backend.dto.PostProjectDTO;
import dit.hua.gr.backend.dto.ProjectResponseDTO;
import dit.hua.gr.backend.model.Project;
import dit.hua.gr.backend.model.ProjectStatus;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.model.NotificationType;
import dit.hua.gr.backend.service.ProjectService;
import dit.hua.gr.backend.service.UserService;
import dit.hua.gr.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/project")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectController {

    private final ProjectService projectService;
    private final UserService userService;
    private final NotificationService notificationService;

    public ProjectController(ProjectService projectService, UserService userService,
            NotificationService notificationService) {
        this.projectService = projectService;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    // Δημιουργία νέου έργου (μόνο για CLIENT)
    @PreAuthorize("hasRole('CLIENT')")
    @PostMapping("/post")
    public ResponseEntity<ProjectResponseDTO> postProject(
            Authentication authentication,
            @RequestBody PostProjectDTO projectDTO) {

        Project newProject = new Project();
        String username = authentication.getName();
        Optional<User> client = userService.findUserByUsername(username);

        if (client.isEmpty()) {
            throw new IllegalArgumentException("Client not found with username: " + username);
        }
        newProject.setClient(client.get());
        newProject.setTitle(projectDTO.getTitle());
        newProject.setDescription(projectDTO.getDescription());
        newProject.setBudget(projectDTO.getBudget());
        newProject.setDeadline(projectDTO.getDeadline());

        Project savedProject = projectService.saveProject(newProject);

        // Map Project to ProjectResponseDTO
        ProjectResponseDTO responseDTO = new ProjectResponseDTO(
                savedProject.getId(),
                savedProject.getTitle(),
                savedProject.getDescription(),
                savedProject.getBudget(),
                savedProject.getDeadline(),
                savedProject.getClient().getUsername(),
                savedProject.getProjectStatus(),
                savedProject.getCreated_at().toString().substring(0, 10));

        return ResponseEntity.ok(responseDTO);
    }

    // Εύρεση έργου με βάση το ID (για ADMIN, CLIENT και FREELANCER αν είναι
    // ανατεθειμένο σε αυτούς)
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('FREELANCER')")
    @GetMapping("/id/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Integer id) {
        Optional<Project> project = projectService.findProjectById(id);
        return project.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('FREELANCER')")
    @GetMapping("/title/{title}")
    public ResponseEntity<List<ProjectResponseDTO>> getProjectsByTitle(@PathVariable String title) {
        List<Project> projects = projectService.findProjectsByTitleContaining(title);

        List<ProjectResponseDTO> projectDTOs = projects.stream()
                .map(project -> new ProjectResponseDTO(
                        project.getId(),
                        project.getTitle(),
                        project.getDescription(),
                        project.getBudget(),
                        project.getDeadline(),
                        project.getClient().getUsername(),
                        project.getProjectStatus(),
                        project.getCreated_at().toString().substring(0, 10)))
                .toList();

        // Use the correct variable name
        return ResponseEntity.ok(projectDTOs);
    }

    // Εύρεση όλων των έργων (μόνο για ADMIN)
    @GetMapping("/allProjects")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProjectResponseDTO>> getAllProjects() {
        List<Project> projects = projectService.findAllProjects();

        List<ProjectResponseDTO> projectResponseDTOs = projects.stream()
                .map(project -> new ProjectResponseDTO(
                        project.getId(),
                        project.getTitle(),
                        project.getDescription(),
                        project.getBudget(),
                        project.getDeadline(),
                        project.getClient().getUsername(),
                        project.getProjectStatus(),
                        project.getCreated_at().toString().substring(0, 10)))
                .collect(Collectors.toList());

        return ResponseEntity.ok(projectResponseDTOs);
    }

    // Εύρεση διαθέσιμων έργων
    @GetMapping("/available")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<List<PostProjectDTO>> getAvailableProjects() {
        List<Project> projects = projectService.findAvailableProjects();

        List<PostProjectDTO> projectDTOs = projects.stream()
                .map(project -> new PostProjectDTO(
                        project.getId(),
                        project.getTitle(),
                        project.getDescription(),
                        project.getBudget(),
                        project.getDeadline(),
                        project.getClient().getUsername(),
                        project.getProjectStatus()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(projectDTOs);
    }

    @GetMapping("/my-projects")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<List<ProjectResponseDTO>> getProjectsByClient(Authentication authentication) {
        String username = authentication.getName();
        User client = userService.findUserByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Client not found with username: " + username));
        List<Project> projects = projectService.findProjectsByClient(client);
        List<ProjectResponseDTO> dto = projects.stream()
                .map(project -> new ProjectResponseDTO(
                        project.getId(),
                        project.getTitle(),
                        project.getDescription(),
                        project.getBudget(),
                        project.getDeadline(),
                        project.getClient().getUsername(),
                        project.getProjectStatus(),
                        project.getCreated_at().toString().substring(0, 10)))
                .toList();
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/freelancer/my-projects")
    @PreAuthorize("hasRole('FREELANCER') or hasRole('ADMIN')")
    public ResponseEntity<List<ProjectResponseDTO>> getProjectsByFreelancer(Authentication authentication) {
        String username = authentication.getName();
        List<Project> projects = projectService.findProjectsByFreelancer(username);
        List<ProjectResponseDTO> dto = projects.stream().map(
                project -> new ProjectResponseDTO(
                        project.getId(),
                        project.getTitle(),
                        project.getDescription(),
                        project.getBudget(),
                        project.getDeadline(),
                        project.getClient().getUsername(),
                        project.getProjectStatus(),
                        project.getCreated_at().toString().substring(0, 10)))
                .toList();
        return ResponseEntity.ok(dto);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('FREELANCER')")
    @PutMapping("/{id}/complete")
    public ResponseEntity<ProjectResponseDTO> markProjectAsCompleted(@PathVariable Integer id) {
        try {
            Project project = projectService.updateProjectStatus(id, ProjectStatus.COMPLETED);

            // Create notification for the client
            notificationService.createNotification(
                    project.getClient(),
                    "Project '" + project.getTitle() + "' has been marked as completed",
                    NotificationType.PROJECT_COMPLETED);

            ProjectResponseDTO projectDTO = new ProjectResponseDTO(
                    project.getId(),
                    project.getTitle(),
                    project.getDescription(),
                    project.getBudget(),
                    project.getDeadline(),
                    project.getClient().getUsername(),
                    project.getProjectStatus(),
                    project.getCreated_at().toString().substring(0, 10));
            return ResponseEntity.ok(projectDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Project> approveProject(@PathVariable Integer id) {
        Project project = projectService.approveProject(id);
        return ResponseEntity.ok(project);
    }

    @PutMapping("/{id}/deny")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Project> rejectProject(@PathVariable Integer id) {
        Project project = projectService.rejectProject(id);
        return ResponseEntity.ok(project);
    }

    // Ενημέρωση έργου (μόνο για ADMIN)
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Integer id, @RequestBody Project updatedProject) {
        try {
            Project project = projectService.updateProject(id, updatedProject);
            return ResponseEntity.ok(project);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Διαγραφή έργου (μόνο για ADMIN)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    public ResponseEntity<Void> deleteProject(@PathVariable Integer id) {
        try {
            projectService.deleteProject(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

}