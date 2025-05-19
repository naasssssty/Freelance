package dit.hua.gr.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSendSimpleMessage() {
        // Arrange
        String to = "recipient@example.com";
        String subject = "Test Subject";
        String text = "Test Message";

        // Act
        emailService.sendSimpleMessage(to, subject, text);

        // Assert
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void testSendRegistrationConfirmation() {
        // Arrange
        String to = "user@example.com";
        String username = "testuser";

        // Act
        emailService.sendRegistrationConfirmation(to, username);

        // Assert
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void testSendProjectApprovalNotification() {
        // Arrange
        String to = "client@example.com";
        String projectTitle = "Test Project";

        // Act
        emailService.sendProjectApprovalNotification(to, projectTitle);

        // Assert
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }
} 