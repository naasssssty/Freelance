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
                        .requestMatchers("/login", "/register").permitAll()
                        .requestMatchers("/user/**").hasRole("ADMIN")
                        .requestMatchers("/project/allProjects").hasRole("ADMIN")
                        .requestMatchers("/project/post").hasAnyRole("ADMIN", "CLIENT")
                        .requestMatchers("/project/available").hasRole("FREELANCER")
                        .requestMatchers("/project/{projectId}/apply/{username}").hasRole("FREELANCER")
                        .requestMatchers("/client/*/my-applications").hasAnyRole("ADMIN", "CLIENT")
                        .requestMatchers("/freelancer/**").hasRole("FREELANCER")
                        .requestMatchers("/client/**").hasRole("CLIENT")
                        .requestMatchers("/project/client/{username}/my-projects").hasAnyRole("ADMIN", "CLIENT")
                        .requestMatchers("/project/freelancer/{username}/my-projects").hasAnyRole("ADMIN", "FREELANCER")
                        .requestMatchers("/application/{applicationId}/approve").hasAnyRole("ADMIN", "CLIENT")
                        .requestMatchers("/application/{applicationId}/reject").hasAnyRole("ADMIN", "CLIENT")
                        .requestMatchers("/project/{projectId}/complete").hasAnyRole("ADMIN", "FREELANCER")
                        .requestMatchers("/chat/**").authenticated()
                        .requestMatchers("/notifications/**").hasAnyRole("CLIENT", "FREELANCER", "ADMIN")
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
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
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