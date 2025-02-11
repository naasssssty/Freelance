package dit.hua.gr.backend.dto;

import dit.hua.gr.backend.model.ProjectStatus;

public class FApplicationDTO {
    private Integer id;
    private String projectTitle;
    private ProjectStatus projectStatus;
    private String deadline;
    private Double budget;
    private String created_at;

    public FApplicationDTO() {
    }

    public FApplicationDTO(Integer id, String projectTitle, ProjectStatus projectStatus, String deadline, Double budget, String created_at) {
        this.id = id;
        this.projectTitle = projectTitle;
        this.projectStatus = projectStatus;
        this.deadline = deadline;
        this.budget = budget;
        this.created_at = created_at;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getProjectTitle() {
        return projectTitle;
    }

    public void setProjectTitle(String projectTitle) {
        this.projectTitle = projectTitle;
    }

    public ProjectStatus getProjectStatus() {
        return projectStatus;
    }

    public void setProjectStatus(ProjectStatus projectStatus) {
        this.projectStatus = projectStatus;
    }

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline.substring(0,10);
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public String getCreated_at() {
        return created_at;
    }

    public void setCreated_at(String created_at) {
        this.created_at = created_at.substring(0, 10);
    }

}