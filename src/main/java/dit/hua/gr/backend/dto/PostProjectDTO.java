//PostProjectDTO.java

package dit.hua.gr.backend.dto;

import dit.hua.gr.backend.model.ProjectStatus;
import java.time.LocalDate;

public class PostProjectDTO {

    private Integer id;
    private String title;
    private String description;
    private Double budget;
    private LocalDate deadline;
    private String clientUsername;
    private ProjectStatus projectStatus;

    public PostProjectDTO() {
    }

    public PostProjectDTO(Integer id, String title, String description, Double budget, LocalDate deadline, String clientUsername, ProjectStatus projectStatus) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.budget = budget;
        this.deadline = deadline;
        this.clientUsername = clientUsername;
        this.projectStatus = projectStatus;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public String getClientUsername() {
        return clientUsername;
    }

    public void setClientUsername(String clientUsername) {
        this.clientUsername = clientUsername;
    }

    public ProjectStatus getProjectStatus() {
        return projectStatus;
    }

    public void setProjectStatus(ProjectStatus projectStatus) {
        this.projectStatus = projectStatus;
    }
}
