package dit.hua.gr.backend.repository;

import dit.hua.gr.backend.model.Chat;
import dit.hua.gr.backend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Integer> {
    Optional<Chat> findByProject(Project project);
}