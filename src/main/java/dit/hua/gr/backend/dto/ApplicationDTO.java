package dit.hua.gr.backend.dto;

import dit.hua.gr.backend.model.ApplicationStatus;

public class ApplicationDTO {
    private Integer id;
    private String projectTitle;
    private Integer project_id;
    private String cover_letter;
    private ApplicationStatus applicationStatus;
    private String freelancer;
    private String created_at;
    private String cvFilePath;

    public ApplicationDTO() {
    }

    public ApplicationDTO(Integer id, String projectTitle, Integer project_id, String cover_letter,
            ApplicationStatus applicationStatus, String freelancer, String created_at) {
        this.id = id;
        this.projectTitle = projectTitle;
        this.project_id = project_id;
        this.cover_letter = cover_letter;
        this.applicationStatus = applicationStatus;
        this.freelancer = freelancer;
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

    public Integer getProject_id() {
        return project_id;
    }

    public void setProject_id(Integer project_id) {
        this.project_id = project_id;
    }

    public String getCover_letter() {
        return cover_letter;
    }

    public void setCover_letter(String cover_letter) {
        this.cover_letter = cover_letter;
    }

    public ApplicationStatus getApplicationStatus() {
        return applicationStatus;
    }

    public void setApplicationStatus(ApplicationStatus applicationStatus) {
        this.applicationStatus = applicationStatus;
    }

    public String getFreelancer() {
        return freelancer;
    }

    public void setFreelancer(String freelancer) {
        this.freelancer = freelancer;
    }

    public String getCreated_at() {
        return created_at;
    }

    public void setCreated_at(String created_at) {
        this.created_at = created_at.substring(0, 10);
    }

    public String getCvFilePath() {
        return cvFilePath;
    }

    public void setCvFilePath(String cvFilePath) {
        this.cvFilePath = cvFilePath;
    }
}
