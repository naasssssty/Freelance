package dit.hua.gr.backend.controller;

import dit.hua.gr.backend.dto.MessageDTO;
import dit.hua.gr.backend.model.Chat;
import dit.hua.gr.backend.model.Message;
import dit.hua.gr.backend.model.Project;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.service.ChatService;
import dit.hua.gr.backend.service.ProjectService;
import dit.hua.gr.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {
    private final ChatService chatService;
    private final ProjectService projectService;
    private final UserService userService;

    public ChatController(ChatService chatService, ProjectService projectService, UserService userService) {
        this.chatService = chatService;
        this.projectService = projectService;
        this.userService = userService;
    }

    @PreAuthorize("hasAnyRole('CLIENT', 'FREELANCER')")
    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getChatByProject(@PathVariable Integer projectId, Authentication authentication) {
        Project project = projectService.findProjectById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String username = authentication.getName();
        User user = userService.findUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify user is either the client or the assigned freelancer
        if (!project.getClient().getUsername().equals(username) &&
                (project.getFreelancer() == null || !project.getFreelancer().getUsername().equals(username))) {
            return ResponseEntity.status(403).body("Unauthorized access to chat");
        }

        Optional<Chat> chatOpt = chatService.getChatByProject(project);
        Chat chat;
        if (chatOpt.isEmpty()) {
            // Create new chat if it doesn't exist
            chat = chatService.createChat(project, project.getClient(), project.getFreelancer());
        } else {
            chat = chatOpt.get();
        }

        List<MessageDTO> messages = chatService.getChatMessages(chat).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(messages);
    }

    @PreAuthorize("hasAnyRole('CLIENT', 'FREELANCER')")
    @PostMapping("/project/{projectId}/message")
    public ResponseEntity<?> sendMessage(
            @PathVariable Integer projectId,
            @RequestBody String content,
            Authentication authentication) {

        Project project = projectService.findProjectById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String username = authentication.getName();
        User sender = userService.findUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify sender is either the client or the assigned freelancer
        if (!project.getClient().getUsername().equals(username) &&
                (project.getFreelancer() == null || !project.getFreelancer().getUsername().equals(username))) {
            return ResponseEntity.status(403).body("Unauthorized to send message");
        }

        Chat chat = chatService.getChatByProject(project)
                .orElseGet(() -> chatService.createChat(project, project.getClient(), project.getFreelancer()));

        Message message = chatService.sendMessage(chat, sender, content);
        return ResponseEntity.ok(convertToDTO(message));
    }

    private MessageDTO convertToDTO(Message message) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return new MessageDTO(
                message.getId(),
                message.getContent(),
                message.getSender().getUsername(),
                message.getTimestamp().format(formatter),
                message.isRead()
        );
    }
}