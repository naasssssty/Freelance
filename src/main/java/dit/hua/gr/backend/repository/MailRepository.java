package dit.hua.gr.backend.repository;

import dit.hua.gr.backend.model.Mail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MailRepository extends JpaRepository<Mail, Long> {
    List<Mail> findBySentOrderBySentAtDesc(boolean sent);
    List<Mail> findByRecipientOrderBySentAtDesc(String recipient);
} 