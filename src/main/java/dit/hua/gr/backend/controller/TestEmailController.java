package dit.hua.gr.backend.controller;

import dit.hua.gr.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test-email")
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
            return ResponseEntity.ok("Test email sent successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send test email: " + e.getMessage());
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