package dit.hua.gr.backend.controller;

import dit.hua.gr.backend.dto.MessageDTO;
import dit.hua.gr.backend.dto.MessageRequest;
import dit.hua.gr.backend.model.ChatMessage;
import dit.hua.gr.backend.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {
    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PreAuthorize("hasAnyRole('CLIENT', 'FREELANCER')")
    @GetMapping("/{projectId}/messages")
    public ResponseEntity<List<MessageDTO>> getMessages(
            @PathVariable Integer projectId, 
            Authentication authentication) {
        if (projectId == null) {
            throw new IllegalArgumentException("Project ID cannot be null");
        }
        
        String username = authentication.getName();
        List<ChatMessage> messages = chatService.getMessagesByProject(projectId);
        List<MessageDTO> messageDTOs = messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(messageDTOs);
    }

    @PreAuthorize("hasAnyRole('CLIENT', 'FREELANCER')")
    @PostMapping("/{projectId}/send")
    public ResponseEntity<MessageDTO> sendMessage(
            @PathVariable Integer projectId,
            @RequestBody MessageRequest message,
            Authentication authentication) {
        String username = authentication.getName();
        ChatMessage savedMessage = chatService.saveMessage(projectId, username, message.getContent());
        return ResponseEntity.ok(convertToDTO(savedMessage));
    }

    private MessageDTO convertToDTO(ChatMessage message) {
        return new MessageDTO(
                message.getId(),
                message.getContent(),
                message.getSender().getUsername(),
                message.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
        );
    }
}