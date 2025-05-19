package dit.hua.gr.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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
    void testSendVerificationEmail() {
        // Arrange
        String to = "user@example.com";
        String username = "testuser";
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        // Act
        emailService.sendVerificationEmail(to, username);

        // Assert
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void testSendSimpleEmail() {
        // Arrange
        String to = "client@example.com";
        String subject = "Test Subject";
        String text = "Test Message";
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        // Act
        emailService.sendSimpleEmail(to, subject, text);

        // Assert
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }
} 