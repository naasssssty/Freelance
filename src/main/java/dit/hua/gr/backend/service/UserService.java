package dit.hua.gr.backend.service;

import dit.hua.gr.backend.dto.UserDTO;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Δημιουργία ή αποθήκευση χρήστη
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public User verifyFreelancer(String username, Boolean verify){
            return userRepository.findByUsername(username).map(existingUser ->{
                existingUser.setVerified(verify);
                return userRepository.save(existingUser);
            }).orElseThrow(() -> new IllegalArgumentException("User with username " + username + " not found"));
    }

    //APIs
    // get   /projects - all projects for admin
    // get   /users  -  all users
    // put   /users/{id}/verify       for admin
    //  get  /projects  - all projects
    // put   /projects/{id}/verify  -   verify project  for admin
    //  get  /projects/{username}    -   client can see his projects
    //  get  /projects/{title}
    // post   /projects/post
    //  post  /projects/{id}/apply/{username}
    //  get  /projects/{id}/applications
    //  get  /projects/{id}/hire    - client can see the hire of his project
    // post  /applications/{id}/hire
    // put   /applications/{id}/verify
    // put   /

    // Εύρεση χρήστη με βάση το ID
    public Optional<User> findUserById(Integer id) {
        return userRepository.findById(id);
    }

    // Εύρεση χρήστη με βάση το username
    public Optional<User> findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // Εύρεση όλων των χρηστών
    public List<UserDTO> findAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(user -> new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRole(), user.isVerified()))
                .collect(Collectors.toList());
    }


    // Ενημέρωση χρήστη
    public User updateUser(Integer id, User updatedUser) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setUsername(updatedUser.getUsername());
                    user.setEmail(updatedUser.getEmail());
                    user.setPassword(updatedUser.getPassword());
                    user.setRole(updatedUser.getRole());
                    return userRepository.save(user);
                })
                .orElseThrow(() -> new IllegalArgumentException("User with id " + id + " not found"));
    }

    // Διαγραφή χρήστη
    public void deleteUser(Integer id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("User with id " + id + " not found");
        }
    }
}
