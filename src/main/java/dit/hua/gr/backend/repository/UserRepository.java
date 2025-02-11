//UserRepository.java
package dit.hua.gr.backend.repository;

import dit.hua.gr.backend.model.Role;
import dit.hua.gr.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findByRole(Role role);

    @Query("SELECT u FROM User u ORDER BY u.isVerified ASC")
    List<User> findAll();

}
