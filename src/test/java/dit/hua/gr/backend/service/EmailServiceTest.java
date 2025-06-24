package dit.hua.gr.backend.service;

import dit.hua.gr.backend.model.Mail;
import dit.hua.gr.backend.model.MailType;
import dit.hua.gr.backend.repository.MailRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private MailRepository mailRepository;

    @InjectMocks
    private EmailService emailService;

    @Captor
    private ArgumentCaptor<SimpleMailMessage> messageCaptor;

    @Captor
    private ArgumentCaptor<Mail> mailCaptor;

    private String testEmail;
    private String testUsername;

    @BeforeEach
    void setUp() {
        testEmail = "test@example.com";
        testUsername = "testuser";
    }

    @Test
    void sendVerificationEmail_ShouldSendEmailAndSaveMail() {
        // Arrange
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));
        when(mailRepository.save(any(Mail.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        emailService.sendVerificationEmail(testEmail, testUsername);

        // Assert
        verify(mailSender).send(messageCaptor.capture());
        verify(mailRepository).save(mailCaptor.capture());

        SimpleMailMessage capturedMessage = messageCaptor.getValue();
        assertEquals(testEmail, capturedMessage.getTo()[0]);
        assertEquals("Account Verification - Freelance Platform", capturedMessage.getSubject());
        assertTrue(capturedMessage.getText().contains("Dear " + testUsername));
        assertTrue(capturedMessage.getText().contains("account has been verified"));

        Mail capturedMail = mailCaptor.getValue();
        assertEquals(testEmail, capturedMail.getRecipient());
        assertEquals("Account Verification - Freelance Platform", capturedMail.getSubject());
        assertTrue(capturedMail.getContent().contains("Dear " + testUsername));
        assertEquals(MailType.VERIFICATION, capturedMail.getMailType());
        assertTrue(capturedMail.isSent());
    }

    @Test
    void sendVerificationEmail_WhenExceptionOccurs_ShouldSaveMailWithSentFalse() {
        // Arrange
        doThrow(new RuntimeException("Mail server error")).when(mailSender).send(any(SimpleMailMessage.class));
        when(mailRepository.save(any(Mail.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        emailService.sendVerificationEmail(testEmail, testUsername);

        // Assert
        verify(mailSender).send(any(SimpleMailMessage.class));
        verify(mailRepository).save(mailCaptor.capture());

        Mail capturedMail = mailCaptor.getValue();
        assertEquals(testEmail, capturedMail.getRecipient());
        assertEquals("Account Verification - Freelance Platform", capturedMail.getSubject());
        assertEquals(MailType.VERIFICATION, capturedMail.getMailType());
        assertFalse(capturedMail.isSent());
    }

    @Test
    void createMail_ShouldSaveAndReturnMail() {
        // Arrange
        String subject = "Test Subject";
        String content = "Test Content";
        MailType mailType = MailType.PROJECT_NOTIFICATION;

        Mail mail = new Mail(testEmail, subject, content, mailType);
        when(mailRepository.save(any(Mail.class))).thenReturn(mail);

        // Act
        Mail result = emailService.createMail(testEmail, subject, content, mailType);

        // Assert
        assertNotNull(result);
        assertEquals(testEmail, result.getRecipient());
        assertEquals(subject, result.getSubject());
        assertEquals(content, result.getContent());
        assertEquals(mailType, result.getMailType());
        verify(mailRepository).save(any(Mail.class));
    }

    @Test
    void sendPasswordResetEmail_ShouldSendEmailAndSaveMail() {
        // Arrange
        String resetToken = "test-reset-token";
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));
        when(mailRepository.save(any(Mail.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        emailService.sendPasswordResetEmail(testEmail, testUsername, resetToken);

        // Assert
        verify(mailSender).send(messageCaptor.capture());
        verify(mailRepository).save(mailCaptor.capture());

        SimpleMailMessage capturedMessage = messageCaptor.getValue();
        assertEquals(testEmail, capturedMessage.getTo()[0]);
        assertEquals("Password Reset - Freelance Platform", capturedMessage.getSubject());
        assertTrue(capturedMessage.getText().contains("Dear " + testUsername));
        assertTrue(capturedMessage.getText().contains(resetToken));

        Mail capturedMail = mailCaptor.getValue();
        assertEquals(testEmail, capturedMail.getRecipient());
        assertEquals("Password Reset - Freelance Platform", capturedMail.getSubject());
        assertTrue(capturedMail.getContent().contains("Dear " + testUsername));
        assertTrue(capturedMail.getContent().contains(resetToken));
        assertEquals(MailType.PASSWORD_RESET, capturedMail.getMailType());
        assertTrue(capturedMail.isSent());
    }

    @Test
    void sendPasswordResetEmail_WhenExceptionOccurs_ShouldSaveMailWithSentFalse() {
        // Arrange
        String resetToken = "test-reset-token";
        doThrow(new RuntimeException("Mail server error")).when(mailSender).send(any(SimpleMailMessage.class));
        when(mailRepository.save(any(Mail.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        emailService.sendPasswordResetEmail(testEmail, testUsername, resetToken);

        // Assert
        verify(mailSender).send(any(SimpleMailMessage.class));
        verify(mailRepository).save(mailCaptor.capture());

        Mail capturedMail = mailCaptor.getValue();
        assertEquals(testEmail, capturedMail.getRecipient());
        assertEquals("Password Reset - Freelance Platform", capturedMail.getSubject());
        assertEquals(MailType.PASSWORD_RESET, capturedMail.getMailType());
        assertFalse(capturedMail.isSent());
    }

    @Test
    void sendSimpleEmail_ShouldSendEmail() {
        // Arrange
        String subject = "Test Subject";
        String content = "Test Content";
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        // Act
        emailService.sendSimpleEmail(testEmail, subject, content);

        // Assert
        verify(mailSender).send(messageCaptor.capture());

        SimpleMailMessage capturedMessage = messageCaptor.getValue();
        assertEquals(testEmail, capturedMessage.getTo()[0]);
        assertEquals(subject, capturedMessage.getSubject());
        assertEquals(content, capturedMessage.getText());
    }

    @Test
    void sendSimpleEmail_WhenExceptionOccurs_ShouldPropagateException() {
        // Arrange
        String subject = "Test Subject";
        String content = "Test Content";
        doThrow(new RuntimeException("Mail server error")).when(mailSender).send(any(SimpleMailMessage.class));

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            emailService.sendSimpleEmail(testEmail, subject, content);
        });

        assertEquals("Mail server error", exception.getMessage());
        verify(mailSender).send(any(SimpleMailMessage.class));
    }
} 