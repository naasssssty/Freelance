package dit.hua.gr.backend.service;

import dit.hua.gr.backend.model.Chat;
import dit.hua.gr.backend.model.Message;
import dit.hua.gr.backend.model.Project;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.repository.ChatRepository;
import dit.hua.gr.backend.repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ChatService {
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;

    public ChatService(ChatRepository chatRepository, MessageRepository messageRepository) {
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
    }

    public Chat createChat(Project project, User client, User freelancer) {
        Chat chat = new Chat();
        chat.setProject(project);
        chat.setClient(client);
        chat.setFreelancer(freelancer);
        return chatRepository.save(chat);
    }

    public Message sendMessage(Chat chat, User sender, String content) {
        Message message = new Message();
        message.setChat(chat);
        message.setSender(sender);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        message.setRead(false);
        return messageRepository.save(message);
    }

    public List<Message> getChatMessages(Chat chat) {
        return messageRepository.findByChatOrderByTimestampAsc(chat);
    }

    public Optional<Chat> getChatByProject(Project project) {
        return chatRepository.findByProject(project);
    }
}