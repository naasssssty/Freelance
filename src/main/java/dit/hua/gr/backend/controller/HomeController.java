package dit.hua.gr.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "https://ergohub.duckdns.org"})
public class HomeController {

    @GetMapping("/home")
    public ResponseEntity<String> home(){

    return ResponseEntity.ok("Welcome to the Freelancer application!");
    }

}
