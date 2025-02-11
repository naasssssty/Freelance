//ApplicationService.java

package dit.hua.gr.backend.service;

import dit.hua.gr.backend.model.*;
import dit.hua.gr.backend.repository.ApplicationRepository;
import dit.hua.gr.backend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ProjectRepository projectRepository;
    private final UserService userService;
    private final ProjectService projectService;

    @Autowired
    public ApplicationService(ApplicationRepository applicationRepository, ProjectRepository projectRepository, UserService userService, ProjectService projectService) {
        this.applicationRepository = applicationRepository;
        this.projectRepository = projectRepository;
        this.userService = userService;
        this.projectService = projectService;
    }

    // Δημιουργία νέας αίτησης
    public Application createApplication(Integer projectId, String freelancerUsername, String cover_letter) {
        Optional<Project> projectOpt = projectService.findProjectById(projectId);
        Project project = projectOpt.orElseThrow(() -> new RuntimeException("Project not found with ID: " + projectId));
        Optional<User> freelancerOpt = userService.findUserByUsername(freelancerUsername);
        User freelancer = freelancerOpt.orElseThrow(() -> new RuntimeException("Freelancer not found with username: " + freelancerUsername));
        Application application = new Application();
        application.setProject(project);
        application.setFreelancer(freelancer);
        application.setApplicationStatus(ApplicationStatus.WAITING);
        application.setCover_letter(cover_letter);
        application.setCreated_at(LocalDateTime.now());
        return applicationRepository.save(application);
    }


    public List<Application> getApplicationsByClient(User client) {
        User user = userService.findUserByUsername(client.getUsername()).orElseThrow(() -> new RuntimeException("Client not found with username: " + client.getUsername()));
        Integer clientId = user.getId();

        return applicationRepository.findByClient(clientId);
    }

    // Εύρεση αιτήσεων που έχει υποβάλει συγκεκριμένος freelancer
    public List<Application> getApplicationsByFreelancer(User freelancer) {
        return applicationRepository.findByFreelancer(freelancer);
    }

//    public List<Application> getProjectsByFreelancer(User freelancer){
//        List<ProjectStatus> statuses = new ArrayList<>();
//        statuses.add(ProjectStatus.IN_PROGRESS);
//        statuses.add(ProjectStatus.EXPIRED);
//        statuses.add(ProjectStatus.COMPLETED);
//        return applicationRepository.findAcceptedApplicationsByFreelancer(freelancer, statuses);
//
//
//    }

    // Εύρεση αιτήσεων για συγκεκριμένο project
    public List<Application> getApplicationsByProject(Project project) {
        return applicationRepository.findByProject(project);
    }

    // Εύρεση αιτήσεων με συγκεκριμένη κατάσταση
    public List<Application> getApplicationsByStatus(ApplicationStatus status) {
        return applicationRepository.findByApplicationStatus(status);
    }

    // Εύρεση αίτησης με βάση το project και τον freelancer
    public Optional<Application> getApplicationByProjectAndFreelancer(Project project, User freelancer) {
        return applicationRepository.findByProjectAndFreelancer(project, freelancer);
    }

    public Application updateApplicationStatus(Integer applicationId, ApplicationStatus status) {
        Optional<Application> applicationOpt = applicationRepository.findById(applicationId);
        Application application = applicationOpt.orElseThrow(() -> new RuntimeException("Application not found with ID: " + applicationId));
        application.setApplicationStatus(status);
        return applicationRepository.save(application);
    }


    public Application acceptApplication(Integer applicationId) {
        // Find the application to approve
        Optional<Application> applicationOpt = applicationRepository.findById(applicationId);
        Application application = applicationOpt.orElseThrow(() -> new RuntimeException("Application not found with ID: " + applicationId));

        // Get the project related to this application
        Project project = application.getProject();

        // Update the application status to approved
        application.setApplicationStatus(ApplicationStatus.APPROVED);
        applicationRepository.save(application);  // Save the approved application

        Project updated = application.getProject();  // Update the project with the approved application's freelancer
        updated.setFreelancer(application.getFreelancer());
        projectRepository.save(updated);  // Save the updated project

        // Fetch all other applications for the same project
        List<Application> allApplications = applicationRepository.findByProject(project);

        // Loop through all applications and reject the ones that are not approved
        for (Application otherApplication : allApplications) {
            if (!otherApplication.equals(application)) {
                otherApplication.setApplicationStatus(ApplicationStatus.REJECTED);
                applicationRepository.save(otherApplication);
            }
        }

        return application;  // Return the approved application
    }


    // Διαγραφή αίτησης
    public void deleteApplication(Integer applicationId) {
        if (applicationRepository.existsById(applicationId)) {
            applicationRepository.deleteById(applicationId);
        } else {
            throw new RuntimeException("Application not found with ID: " + applicationId);
        }
    }
}
