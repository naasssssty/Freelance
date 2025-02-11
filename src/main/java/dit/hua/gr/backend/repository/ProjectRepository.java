//ProjectRepository.java

package dit.hua.gr.backend.repository;

import dit.hua.gr.backend.model.Project;
import dit.hua.gr.backend.model.ProjectStatus;
import dit.hua.gr.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Integer> {

    @Query("SELECT p FROM Project p WHERE p.client = :client " +
            "ORDER BY CASE " +
            "WHEN p.projectStatus = 'IN_PROGRESS' THEN 1 " +
            "WHEN p.projectStatus = 'COMPLETED' THEN 2 " +
            "WHEN p.projectStatus = 'EXPIRED' THEN 3 " +
            "WHEN p.projectStatus = 'PENDING' THEN 4" +
            "WHEN p.projectStatus = 'APPROVED' THEN 5 " +
            "ELSE 6 END")
    List<Project> findByClient(@Param("client") User client);


    // Εύρεση έργων με βάση την κατάσταση του έργου
    List<Project> findByProjectStatus(ProjectStatus projectStatus);

    @Query("SELECT p FROM Project p " +
            "ORDER BY CASE " +
            "WHEN p.projectStatus = 'PENDING' THEN 1 " +
            "ELSE 2 END")
    List<Project> findAllProjects();

    // Εύρεση έργων που έχουν ολοκληρωθει
    List<Project> findByDeadlineBefore(LocalDate date);

    List<Project> findByTitle(String title);

    // Εύρεση έργων με βάση τον τίτλο (περιλαμβάνει και case-insensitive αναζήτηση)
    List<Project> findByTitleContainingIgnoreCase(String title);

    @Query("SELECT p FROM Project p WHERE p.freelancer = :freelancer " +
            "ORDER BY CASE " +
            "WHEN p.projectStatus = 'IN_PROGRESS' THEN 1 " +
            "WHEN p.projectStatus = 'EXPIRED' THEN 2 " +
            "WHEN p.projectStatus = 'COMPLETED' THEN 3 " +
            "ELSE 6 END")
    List<Project> findProjectsByFreelancer(User freelancer);
}
