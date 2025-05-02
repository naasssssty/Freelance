package dit.hua.gr.backend.service;

import dit.hua.gr.backend.model.Mail;
import dit.hua.gr.backend.model.MailType;
import dit.hua.gr.backend.repository.MailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final MailRepository mailRepository;

    @Autowired
    public EmailService(JavaMailSender mailSender, MailRepository mailRepository) {
        this.mailSender = mailSender;
        this.mailRepository = mailRepository;
    }

    public void sendVerificationEmail(String to, String username) {
        String subject = "Account Verification - Freelance Platform";
        String content = "Dear " + username + ",\n\n"
                + "Congratulations! Your account has been verified by our administrators.\n\n"
                + "You can now log in to our platform and start using all the features.\n\n"
                + "Welcome to our Freelance Platform!\n\n"
                + "Best regards,\n"
                + "The Freelance Platform Team";

        Mail mail = new Mail(to, subject, content, MailType.VERIFICATION);
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            
            mailSender.send(message);
            mail.setSent(true);
        } catch (Exception e) {
            mail.setSent(false);
            System.err.println("Failed to send email: " + e.getMessage());
        }
        
        mailRepository.save(mail);
    }
    
    public Mail createMail(String recipient, String subject, String content, MailType mailType) {
        Mail mail = new Mail(recipient, subject, content, mailType);
        return mailRepository.save(mail);
    }

    public void sendPasswordResetEmail(String to, String username, String resetToken) {
        String subject = "Password Reset - Freelance Platform";
        String content = "Dear " + username + ",\n\n"
                + "We received a request to reset your password. If you didn't make this request, you can ignore this email.\n\n"
                + "To reset your password, please click on the following link or copy it into your browser:\n\n"
                + "http://localhost:3000/reset-password?token=" + resetToken + "\n\n"
                + "This link will expire in 30 minutes.\n\n"
                + "Best regards,\n"
                + "The Freelance Platform Team";

        Mail mail = new Mail(to, subject, content, MailType.PASSWORD_RESET);
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            
            mailSender.send(message);
            mail.setSent(true);
        } catch (Exception e) {
            mail.setSent(false);
            System.err.println("Failed to send password reset email: " + e.getMessage());
        }
        
        mailRepository.save(mail);
    }

    public void sendSimpleEmail(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            throw e;
        }
    }
} 