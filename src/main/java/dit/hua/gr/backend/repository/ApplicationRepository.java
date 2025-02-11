//ApplicationRepository.java

package dit.hua.gr.backend.repository;

import dit.hua.gr.backend.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Integer> {

    // Εύρεση αιτήσεων που έχει υποβάλει συγκεκριμένος freelancer
    @Query("SELECT a FROM Application a WHERE a.freelancer = :freelancer " +
            "ORDER BY CASE " +
            "WHEN a.applicationStatus = 'WAITING' THEN 1 " +
            "WHEN a.applicationStatus = 'APPROVED' THEN 2 " +
            "ELSE 3 END")
    List<Application> findByFreelancer(User freelancer);

    // Εύρεση αιτήσεων για συγκεκριμένο project
    List<Application> findByProject(Project project);

    // Εύρεση αιτήσεων που έχουν συγκεκριμένη κατάσταση
    List<Application> findByApplicationStatus(ApplicationStatus applicationStatus);

    // Εύρεση αίτησης με βάση το project και το freelancer
    Optional<Application> findByProjectAndFreelancer(Project project, User freelancer);

    Optional<Application> findById(Integer id);

    @Query("SELECT a FROM Application a " +
            "WHERE a.project.client.id = :clientId " +
            "ORDER BY CASE " +
            "WHEN a.applicationStatus = 'WAITING' THEN 1 " +
            "WHEN a.applicationStatus = 'APPROVED' THEN 2 " +
            "ELSE 3 END, a.applicationStatus")
    List<Application> findByClient(@Param("clientId") Integer clientId);



}