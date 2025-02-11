package dit.hua.gr.backend.dto;

import dit.hua.gr.backend.model.Role;

public class UserDTO {
    private Integer id;
    private String username;
    private String email;
    private Role role;
    private Boolean verified;

    public UserDTO() {
    }

    public UserDTO(Integer id, String username, String email, Role role, Boolean verified) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.verified = verified;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Boolean getVerified() {
        return verified;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }
}
