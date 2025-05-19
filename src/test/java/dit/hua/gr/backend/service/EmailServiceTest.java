package dit.hua.gr.backend.service;

import dit.hua.gr.backend.model.Mail;
import dit.hua.gr.backend.repository.MailRepository;
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
    
    @Mock
    private MailRepository mailRepository;

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
        when(mailRepository.save(any(Mail.class))).thenReturn(new Mail());

        // Act
        emailService.sendVerificationEmail(to, username);

        // Assert
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
        verify(mailRepository, times(1)).save(any(Mail.class));
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