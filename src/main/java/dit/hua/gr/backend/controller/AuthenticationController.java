package dit.hua.gr.backend.controller;

import dit.hua.gr.backend.model.AuthenticationResponse;
import dit.hua.gr.backend.model.User;
import dit.hua.gr.backend.service.AuthenticationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class AuthenticationController {

    private  final AuthenticationService authservice;

    public AuthenticationController(AuthenticationService authservice) {
        this.authservice = authservice;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody User request) {
        return ResponseEntity.ok(authservice.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> Login(
            @RequestBody User request
    ){
        return ResponseEntity.ok(authservice.authenticate(request));
    }



}
