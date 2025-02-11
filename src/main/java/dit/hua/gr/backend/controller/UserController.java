package dit.hua.gr.backend.controller;

import dit.hua.gr.backend.dto.UserDTO;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:3000") // Επιτρέπει CORS από React
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Δημιουργία νέου χρήστη (μόνο για ADMIN)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            User savedUser = userService.saveUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{username}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> verifyFreelancer(
            @PathVariable String username,
            @RequestBody Boolean verify
    ){
        try {
            User verifiedUser = userService.verifyFreelancer(username, verify);
            return ResponseEntity.ok(verifiedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // Εύρεση όλων των χρηστών (μόνο για ADMIN)
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        try {
            List<UserDTO> userDTOs = userService.findAllUsers();
            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Εύρεση χρήστη με βάση το ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        Optional<User> user = userService.findUserById(id);

        // Προσθήκη προστασίας και καλύτερου χειρισμού
        return user.map(u -> {
            u.setPassword(null); // Κρύβει τον κωδικό
            return ResponseEntity.ok(u);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Εύρεση χρήστη με βάση το username
    @GetMapping("/username/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username) {
        Optional<User> user = userService.findUserByUsername(username);

        UserDTO dto = new UserDTO();
        if(user.isPresent()){
            User u = user.get();
            dto.setId(u.getId());
            dto.setUsername(u.getUsername());
            dto.setEmail(u.getEmail());
            dto.setRole(u.getRole());
            dto.setVerified(u.isVerified());
        }
        return ResponseEntity.ok(dto);
    }

    // Ενημέρωση χρήστη (μόνο για ADMIN)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(
            @PathVariable Integer id,
            @RequestBody User updatedUser
    ) {
        try {
            User user = userService.updateUser(id, updatedUser);
            user.setPassword(null); // Κρύβει τον κωδικό
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    // Διαγραφή χρήστη (μόνο για ADMIN)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}