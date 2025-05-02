package dit.hua.gr.backend.controller;

import dit.hua.gr.backend.model.Mail;
import dit.hua.gr.backend.repository.MailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/mail")
@CrossOrigin(origins = "http://localhost:3000")
public class MailController {

    private final MailRepository mailRepository;

    @Autowired
    public MailController(MailRepository mailRepository) {
        this.mailRepository = mailRepository;
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Mail>> getAllMails() {
        return ResponseEntity.ok(mailRepository.findAll());
    }

    @GetMapping("/sent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Mail>> getSentMails() {
        return ResponseEntity.ok(mailRepository.findBySentOrderBySentAtDesc(true));
    }

    @GetMapping("/failed")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Mail>> getFailedMails() {
        return ResponseEntity.ok(mailRepository.findBySentOrderBySentAtDesc(false));
    }

    @GetMapping("/user/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Mail>> getMailsByRecipient(@PathVariable String email) {
        return ResponseEntity.ok(mailRepository.findByRecipientOrderBySentAtDesc(email));
    }
} 