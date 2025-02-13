package dit.hua.gr.backend.repository;

import dit.hua.gr.backend.model.ChatMessage;
import dit.hua.gr.backend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByProjectOrderByTimestampAsc(Project project);
} 