package ma.enset.elearning.web;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000") // Autoriser React
public class CourseController {

    @GetMapping("/courses")
    @PreAuthorize("hasAnyRole('ROLE_STUDENT', 'ROLE_ADMIN')")
    public Map<String, String> getCourses() {
        return Map.of("message", "Liste des cours : Java, Angular, Spring Boot");
    }

    @PostMapping("/courses")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Map<String, String> addCourse(@RequestBody String course) {
        return Map.of("message", "Cours ajouté avec succès : " + course);
    }

    @GetMapping("/me")
    public Authentication myProfile(Authentication authentication) {
        return authentication; // Renvoie les infos du token (claims, roles)
    }
}