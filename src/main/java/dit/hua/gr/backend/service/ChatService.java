package dit.hua.gr.backend.service;

import dit.hua.gr.backend.model.ChatMessage;
import dit.hua.gr.backend.model.Project;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.repository.ChatMessageRepository;
import dit.hua.gr.backend.repository.ProjectRepository;
import dit.hua.gr.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {
    private final ChatMessageRepository chatMessageRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ChatService(ChatMessageRepository chatMessageRepository,
                      ProjectRepository projectRepository,
                      UserRepository userRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public ChatMessage saveMessage(Integer projectId, String username, String content) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        User sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify sender is either client or freelancer
        if (!project.getClient().equals(sender) && !project.getFreelancer().equals(sender)) {
            throw new RuntimeException("Unauthorized to send message in this chat");
        }

        ChatMessage message = new ChatMessage();
        message.setProject(project);
        message.setSender(sender);
        message.setContent(content);

        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getMessagesByProject(Integer projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return chatMessageRepository.findByProjectOrderByTimestampAsc(project);
    }
}