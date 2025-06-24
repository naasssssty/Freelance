package dit.hua.gr.backend.service;

import dit.hua.gr.backend.model.*;
import dit.hua.gr.backend.repository.ChatMessageRepository;
import dit.hua.gr.backend.repository.ProjectRepository;
import dit.hua.gr.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChatServiceTest {

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ChatService chatService;

    private User testClient;
    private User testFreelancer;
    private User testOtherUser;
    private Project testProject;
    private ChatMessage testMessage;

    @BeforeEach
    void setUp() {
        // Δημιουργία test client
        testClient = new User();
        testClient.setId(1);
        testClient.setUsername("testclient");
        testClient.setEmail("client@test.com");
        testClient.setRole(Role.CLIENT);
        testClient.setVerified(true);

        // Δημιουργία test freelancer
        testFreelancer = new User();
        testFreelancer.setId(2);
        testFreelancer.setUsername("testfreelancer");
        testFreelancer.setEmail("freelancer@test.com");
        testFreelancer.setRole(Role.FREELANCER);
        testFreelancer.setVerified(true);

        // Δημιουργία test other user (που δεν ανήκει στο project)
        testOtherUser = new User();
        testOtherUser.setId(3);
        testOtherUser.setUsername("otheruser");
        testOtherUser.setEmail("other@test.com");
        testOtherUser.setRole(Role.FREELANCER);
        testOtherUser.setVerified(true);

        // Δημιουργία test project
        testProject = new Project();
        testProject.setId(1);
        testProject.setTitle("Test Project");
        testProject.setDescription("This is a test project");
        testProject.setClient(testClient);
        testProject.setFreelancer(testFreelancer);
        testProject.setProjectStatus(ProjectStatus.IN_PROGRESS);

        // Δημιουργία test message
        testMessage = new ChatMessage();
        testMessage.setId(1L);
        testMessage.setProject(testProject);
        testMessage.setSender(testClient);
        testMessage.setContent("Test message content");
        testMessage.setTimestamp(LocalDateTime.now());
    }

    @Test
    void saveMessage_WhenSenderIsClient_ShouldSaveAndReturnMessage() {
        // Arrange
        when(projectRepository.findById(1)).thenReturn(Optional.of(testProject));
        when(userRepository.findByUsername("testclient")).thenReturn(Optional.of(testClient));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(testMessage);

        // Act
        ChatMessage savedMessage = chatService.saveMessage(1, "testclient", "Test message content");

        // Assert
        assertNotNull(savedMessage);
        assertEquals(testMessage.getId(), savedMessage.getId());
        assertEquals(testMessage.getProject(), savedMessage.getProject());
        assertEquals(testMessage.getSender(), savedMessage.getSender());
        assertEquals(testMessage.getContent(), savedMessage.getContent());
        verify(projectRepository).findById(1);
        verify(userRepository).findByUsername("testclient");
        verify(chatMessageRepository).save(any(ChatMessage.class));
    }

    @Test
    void saveMessage_WhenSenderIsFreelancer_ShouldSaveAndReturnMessage() {
        // Arrange
        testMessage.setSender(testFreelancer);
        when(projectRepository.findById(1)).thenReturn(Optional.of(testProject));
        when(userRepository.findByUsername("testfreelancer")).thenReturn(Optional.of(testFreelancer));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(testMessage);

        // Act
        ChatMessage savedMessage = chatService.saveMessage(1, "testfreelancer", "Test message content");

        // Assert
        assertNotNull(savedMessage);
        assertEquals(testMessage.getId(), savedMessage.getId());
        assertEquals(testMessage.getProject(), savedMessage.getProject());
        assertEquals(testMessage.getSender(), savedMessage.getSender());
        assertEquals(testMessage.getContent(), savedMessage.getContent());
        verify(projectRepository).findById(1);
        verify(userRepository).findByUsername("testfreelancer");
        verify(chatMessageRepository).save(any(ChatMessage.class));
    }

    @Test
    void saveMessage_WhenProjectNotFound_ShouldThrowException() {
        // Arrange
        when(projectRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            chatService.saveMessage(999, "testclient", "Test message content");
        });

        assertEquals("Project not found", exception.getMessage());
        verify(projectRepository).findById(999);
        verify(userRepository, never()).findByUsername(anyString());
        verify(chatMessageRepository, never()).save(any(ChatMessage.class));
    }

    @Test
    void saveMessage_WhenUserNotFound_ShouldThrowException() {
        // Arrange
        when(projectRepository.findById(1)).thenReturn(Optional.of(testProject));
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            chatService.saveMessage(1, "nonexistent", "Test message content");
        });

        assertEquals("User not found", exception.getMessage());
        verify(projectRepository).findById(1);
        verify(userRepository).findByUsername("nonexistent");
        verify(chatMessageRepository, never()).save(any(ChatMessage.class));
    }

    @Test
    void saveMessage_WhenSenderNotAuthorized_ShouldThrowException() {
        // Arrange
        when(projectRepository.findById(1)).thenReturn(Optional.of(testProject));
        when(userRepository.findByUsername("otheruser")).thenReturn(Optional.of(testOtherUser));

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            chatService.saveMessage(1, "otheruser", "Test message content");
        });

        assertEquals("Unauthorized to send message in this chat", exception.getMessage());
        verify(projectRepository).findById(1);
        verify(userRepository).findByUsername("otheruser");
        verify(chatMessageRepository, never()).save(any(ChatMessage.class));
    }

    @Test
    void getMessagesByProject_ShouldReturnProjectMessages() {
        // Arrange
        ChatMessage message1 = new ChatMessage();
        message1.setId(1L);
        message1.setProject(testProject);
        message1.setSender(testClient);
        message1.setContent("Message from client");
        message1.setTimestamp(LocalDateTime.now().minusHours(1));

        ChatMessage message2 = new ChatMessage();
        message2.setId(2L);
        message2.setProject(testProject);
        message2.setSender(testFreelancer);
        message2.setContent("Message from freelancer");
        message2.setTimestamp(LocalDateTime.now());

        List<ChatMessage> messages = Arrays.asList(message1, message2);
        when(projectRepository.findById(1)).thenReturn(Optional.of(testProject));
        when(chatMessageRepository.findByProjectOrderByTimestampAsc(testProject)).thenReturn(messages);

        // Act
        List<ChatMessage> result = chatService.getMessagesByProject(1);

        // Assert
        assertEquals(2, result.size());
        assertEquals(message1.getId(), result.get(0).getId());
        assertEquals(message1.getContent(), result.get(0).getContent());
        assertEquals(message1.getSender(), result.get(0).getSender());
        assertEquals(message2.getId(), result.get(1).getId());
        assertEquals(message2.getContent(), result.get(1).getContent());
        assertEquals(message2.getSender(), result.get(1).getSender());
        verify(projectRepository).findById(1);
        verify(chatMessageRepository).findByProjectOrderByTimestampAsc(testProject);
    }

    @Test
    void getMessagesByProject_WhenProjectNotFound_ShouldThrowException() {
        // Arrange
        when(projectRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            chatService.getMessagesByProject(999);
        });

        assertEquals("Project not found", exception.getMessage());
        verify(projectRepository).findById(999);
        verify(chatMessageRepository, never()).findByProjectOrderByTimestampAsc(any(Project.class));
    }
} 