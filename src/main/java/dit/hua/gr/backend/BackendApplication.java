package dit.hua.gr.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    @Profile("!dev") // This bean will be used when not in dev profile
    public JavaMailSender getJavaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);
        mailSender.setUsername("ananaaa8888@gmail.com");
        mailSender.setPassword("wsmajqqthfkndnxu");
        
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.debug", "true");
        
        return mailSender;
    }
    
    // This bean will be used only in dev profile
    @Bean
    @Profile("dev")
    public JavaMailSender getDevJavaMailSender(
            @org.springframework.beans.factory.annotation.Value("${spring.mail.host}") String host,
            @org.springframework.beans.factory.annotation.Value("${spring.mail.port}") int port,
            @org.springframework.beans.factory.annotation.Value("${spring.mail.username:}") String username,
            @org.springframework.beans.factory.annotation.Value("${spring.mail.password:}") String password,
            @org.springframework.beans.factory.annotation.Value("${spring.mail.properties.mail.smtp.auth:false}") boolean smtpAuth,
            @org.springframework.beans.factory.annotation.Value("${spring.mail.properties.mail.smtp.starttls.enable:false}") boolean starttlsEnable,
            @org.springframework.beans.factory.annotation.Value("${spring.mail.properties.mail.debug:true}") boolean mailDebug
    ) {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(username);
        mailSender.setPassword(password);
        
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", String.valueOf(smtpAuth));
        props.put("mail.smtp.starttls.enable", String.valueOf(starttlsEnable));
        props.put("mail.debug", String.valueOf(mailDebug));
        
        return mailSender;
    }
} 