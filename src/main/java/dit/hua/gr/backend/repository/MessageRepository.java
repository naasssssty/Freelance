package dit.hua.gr.backend.repository;

import dit.hua.gr.backend.model.Chat;
import dit.hua.gr.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {
    List<Message> findByChatOrderByTimestampAsc(Chat chat);
}