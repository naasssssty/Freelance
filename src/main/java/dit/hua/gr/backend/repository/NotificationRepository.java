package dit.hua.gr.backend.repository;

import dit.hua.gr.backend.model.Notification;
import dit.hua.gr.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByTimestampDesc(User user);

    List<Notification> findByUserAndReadFalse(User user);

    long countByUserAndReadFalse(User user);
}