//ApplicationController.java

package dit.hua.gr.backend.controller;

import dit.hua.gr.backend.dto.ApplicationDTO;
import dit.hua.gr.backend.model.*;
import dit.hua.gr.backend.service.ApplicationService;
import dit.hua.gr.backend.service.ProjectService;
import dit.hua.gr.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final ProjectService projectService;
    private final UserService userService;

    public ApplicationController(ApplicationService applicationService, ProjectService projectService, UserService userService) {
        this.applicationService = applicationService;
        this.projectService = projectService;
        this.userService = userService;
    }

    @PostMapping("/project/{projectId}/apply/{username}")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ApplicationDTO> applyForProject(@PathVariable Integer projectId, @PathVariable String username, @RequestBody String cover_letter) {
        Application application = applicationService.createApplication(projectId, username, cover_letter);
        ApplicationDTO applicationDTO = new ApplicationDTO();
        applicationDTO.setProjectTitle(application.getProject().toString());
        applicationDTO.setCover_letter(application.getCover_letter());
        applicationDTO.setApplicationStatus(application.getApplicationStatus());
        applicationDTO.setFreelancer(username);
        applicationDTO.setId(application.getId());
        applicationDTO.setCreated_at(application.getCreated_at().toString());
        return ResponseEntity.ok(applicationDTO);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    @GetMapping("/client/{username}/my-applications")
    public ResponseEntity<List<ApplicationDTO>> getApplicationsByClient(@PathVariable String username) {
        User client = userService.findUserByUsername(username).orElseThrow(() -> new IllegalArgumentException("Client not found with username: " + username));
        List<Application> applications = applicationService.getApplicationsByClient(client);
        List<ApplicationDTO> dto = applications.stream().map(
                application -> new ApplicationDTO(
                        application.getId(),
                        application.getProject().getTitle(),
                        application.getCover_letter(),
                        application.getApplicationStatus(),
                        application.getFreelancer().getUsername(),
                        application.getCreated_at().toString().substring(0,10) // Just date part
                )).toList();
        return ResponseEntity.ok(dto);
    }



    // Εύρεση αιτήσεων από έναν freelancer (μόνο για τον FREELANCER ή ADMIN)
    @PreAuthorize("hasRole('FREELANCER') or hasRole('ADMIN')")
    @GetMapping("/freelancer/{username}/my-applications")
    public ResponseEntity<List<ApplicationDTO>> getApplicationsByFreelancer(@PathVariable String username) {
        User freelancer = userService.findUserByUsername(username).orElseThrow(() -> new IllegalArgumentException("Freelancer not found with username: " + username));
        List<Application> applications = applicationService.getApplicationsByFreelancer(freelancer);
        List<ApplicationDTO> dto = applications.stream().map(
                application -> new ApplicationDTO(
                        application.getId(),
                        application.getProject().getTitle(),
                        application.getCover_letter(),
                        application.getApplicationStatus(),
                        application.getFreelancer().getUsername(),
                        application.getCreated_at().toString().substring(0,10) // Just date part
                )).toList();
        return ResponseEntity.ok(dto);
    }

    // Εύρεση αιτήσεων για συγκεκριμένο project (μόνο για CLIENT ή ADMIN)
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Application>> getApplicationsByProject(@PathVariable Integer projectId) {
        Project project = new Project();
        project.setId(projectId);
        List<Application> applications = applicationService.getApplicationsByProject(project);
        return ResponseEntity.ok(applications);
    }

    // Εύρεση αιτήσεων με συγκεκριμένη κατάσταση (μόνο για ADMIN)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{status}")
    public ResponseEntity<List<Application>> getApplicationsByStatus(@PathVariable String status) {
        ApplicationStatus applicationStatus = ApplicationStatus.valueOf(status.toUpperCase());
        List<Application> applications = applicationService.getApplicationsByStatus(applicationStatus);
        return ResponseEntity.ok(applications);
    }

    // Εύρεση αίτησης με βάση το project και τον freelancer (μόνο για ADMIN)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/project/{projectId}/freelancer/{freelancerId}")
    public ResponseEntity<Application> getApplicationByProjectAndFreelancer(
            @PathVariable Integer projectId, @PathVariable Integer freelancerId) {

        Project project = new Project();
        project.setId(projectId);

        User freelancer = new User();
        freelancer.setId(freelancerId);

        Optional<Application> application = applicationService.getApplicationByProjectAndFreelancer(project, freelancer);

        return application.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Ενημέρωση κατάστασης αίτησης (μόνο για ADMIN)
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    @PutMapping("/application/{applicationId}/approve")
    public ResponseEntity<ApplicationDTO> acceptApplication(
            @PathVariable Integer applicationId) {
        Application updatedApplication = applicationService.acceptApplication(applicationId);
        projectService.updateProjectStatus(updatedApplication.getProject().getId(), ProjectStatus.IN_PROGRESS);
        ApplicationDTO dto = new ApplicationDTO();
        dto.setId(updatedApplication.getId());
        dto.setApplicationStatus(updatedApplication.getApplicationStatus());
        dto.setCreated_at(updatedApplication.getCreated_at().toString());
        dto.setCover_letter(updatedApplication.getCover_letter());
        dto.setFreelancer(updatedApplication.getFreelancer().getUsername());
        dto.setId(updatedApplication.getId());
        dto.setCreated_at(updatedApplication.getCreated_at().toString());
        dto.setProjectTitle(updatedApplication.getProject().getTitle());
        return ResponseEntity.ok(dto);
    }

    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    @PutMapping("/application/{applicationId}/reject")
    public ResponseEntity<ApplicationDTO> rejectApplication(@PathVariable Integer applicationId){
        Application updatedApplication = applicationService.updateApplicationStatus(applicationId, ApplicationStatus.REJECTED);
        ApplicationDTO dto = new ApplicationDTO();
        dto.setId(updatedApplication.getId());
        dto.setApplicationStatus(updatedApplication.getApplicationStatus());
        dto.setCreated_at(updatedApplication.getCreated_at().toString());
        dto.setCover_letter(updatedApplication.getCover_letter());
        dto.setFreelancer(updatedApplication.getFreelancer().getUsername());
        dto.setId(updatedApplication.getId());
        dto.setCreated_at(updatedApplication.getCreated_at().toString());
        dto.setProjectTitle(updatedApplication.getProject().getTitle());
        return ResponseEntity.ok(dto);
    }


    // Διαγραφή αίτησης (μόνο για ADMIN)
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{applicationId}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Integer applicationId) {
        applicationService.deleteApplication(applicationId);
        return ResponseEntity.noContent().build();
    }
}

