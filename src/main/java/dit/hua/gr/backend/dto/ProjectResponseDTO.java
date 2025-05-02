package dit.hua.gr.backend.dto;

import dit.hua.gr.backend.model.ProjectStatus;

import java.time.LocalDate;

public class ProjectResponseDTO {

    private Integer id;
    private String title;
    private String description;
    private Double budget;
    private String deadline;
    private String client_username;
    private ProjectStatus projectStatus;
    private String posted_at;


    public ProjectResponseDTO(Integer id, String title, String description, Double budget, LocalDate deadline, String client_username, ProjectStatus projectStatus, String posted_at) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.budget = budget;
        this.deadline = deadline.toString();
        this.client_username = client_username;
        this.projectStatus = projectStatus;
        this.posted_at = posted_at;
    }

    // Getters and setters

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

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline.substring(0,10);
    }
    public String getClient_username() {
        return client_username;
    }

    public void setClient_username(String client_username) {
        this.client_username = client_username;
    }
    public ProjectStatus getProjectStatus() {
        return projectStatus;
    }

    public void setProjectStatus(ProjectStatus projectStatus) {
        this.projectStatus = projectStatus;
    }

    public String getPosted_at() {
        return posted_at;
    }
    public void setPosted_at(String posted_at) {
        this.posted_at = posted_at;
    }
}
