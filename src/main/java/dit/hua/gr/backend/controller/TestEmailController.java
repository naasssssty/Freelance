package dit.hua.gr.backend.controller;

import dit.hua.gr.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api/test-email")
@CrossOrigin(origins = {"http://localhost:3000", "http://freelance.local"})
public class TestEmailController {

    private final EmailService emailService;

    @Autowired
    public TestEmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendTestEmail(@RequestBody TestEmailRequest request) {
        try {
            emailService.sendSimpleEmail(
                request.getTo(),
                request.getSubject(),
                request.getContent()
            );
            return ResponseEntity.ok("Email sent successfully to " + request.getTo());
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body("Failed to send email: " + e.getMessage());
        }
    }

    @PostMapping("/send-verification")
    public ResponseEntity<String> sendTestVerificationEmail(@RequestBody TestEmailRequest request) {
        try {
            emailService.sendVerificationEmail(request.getTo(), "TestUser");
            return ResponseEntity.ok("Verification email sent successfully to " + request.getTo());
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body("Failed to send verification email: " + e.getMessage());
        }
    }

    // Inner class for the request
    public static class TestEmailRequest {
        private String to;
        private String subject;
        private String content;

        public String getTo() {
            return to;
        }

        public void setTo(String to) {
            this.to = to;
        }

        public String getSubject() {
            return subject;
        }

        public void setSubject(String subject) {
            this.subject = subject;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }
} 