package dit.hua.gr.backend.config;

import dit.hua.gr.backend.filter.JwtAuthenticationFilter;
import dit.hua.gr.backend.service.UserDetailsServiceImp;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final UserDetailsServiceImp userDetailsServiceImp;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(UserDetailsServiceImp userDetailsServiceImp,
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.userDetailsServiceImp = userDetailsServiceImp;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .requestMatchers("/api/login", "/api/register").permitAll()
                        .requestMatchers("/api/user/**").hasRole("ADMIN")
                        .requestMatchers("/api/project/allProjects").hasRole("ADMIN")
                        .requestMatchers("/api/project/post").hasAnyRole("ADMIN", "CLIENT")
                        .requestMatchers("/api/project/available").hasRole("FREELANCER")
                        .requestMatchers("/api/project/{projectId}/apply/{username}").hasRole("FREELANCER")
                        .requestMatchers("/api/client/*/my-applications").hasAnyRole("ADMIN", "CLIENT")
                        .requestMatchers("/api/freelancer/**").hasRole("FREELANCER")
                        .requestMatchers("/api/client/**").hasRole("CLIENT")
                        .requestMatchers("/api/project/client/{username}/my-projects").hasAnyRole("ADMIN", "CLIENT")
                        .requestMatchers("/api/project/freelancer/{username}/my-projects").hasAnyRole("ADMIN", "FREELANCER")
                        .requestMatchers("/api/application/{applicationId}/approve").hasAnyRole("ADMIN", "CLIENT")
                        .requestMatchers("/api/application/{applicationId}/reject").hasAnyRole("ADMIN", "CLIENT")
                        .requestMatchers("/api/project/{projectId}/complete").hasAnyRole("ADMIN", "FREELANCER")
                        .requestMatchers("/api/chat/**").authenticated()
                        .requestMatchers("/api/notifications/**").hasAnyRole("CLIENT", "FREELANCER", "ADMIN")
                        .requestMatchers("/api/report/**").hasAnyRole("CLIENT", "FREELANCER", "ADMIN")
                        .requestMatchers("/api/application/*/download-cv").permitAll()
                        .requestMatchers("/api/home").permitAll()
                        .anyRequest().authenticated())
                .userDetailsService(userDetailsServiceImp)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://freelance.local", "http://freelance.local:31962"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}