package ropold.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import ropold.backend.model.AppUser;
import ropold.backend.repository.AppUserRepository;

import java.util.Collections;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Value("${app.url}")
    private String appUrl;

    private final AppUserRepository appUserRepository;
    private static final String QUESTION = "/api/word-link-hub/**";

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(a -> a
                        .requestMatchers(HttpMethod.POST, "/api/word-link-hub/no-login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/word-link-hub/bulk").permitAll()
                        .requestMatchers(HttpMethod.GET, QUESTION).permitAll()
                        .requestMatchers(HttpMethod.POST, QUESTION).authenticated()
                        .requestMatchers(HttpMethod.PUT, QUESTION).authenticated()
                        .requestMatchers(HttpMethod.DELETE, QUESTION).authenticated()
                        .requestMatchers("/api/users/me").permitAll()
                        .requestMatchers("/api/users/me/details").permitAll()
                        .requestMatchers("/api/high-score").permitAll()
                        .anyRequest().permitAll()
                )
                .logout(l -> l.logoutUrl("/api/users/logout")
                        .logoutSuccessHandler((request, response, authentication) -> response.setStatus(200)))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.ALWAYS))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .oauth2Login(o -> o.defaultSuccessUrl(appUrl));

        return http.build();
    }

    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService() {
        DefaultOAuth2UserService userService = new DefaultOAuth2UserService();

        return (userRequest) -> {
            OAuth2User githubUser = userService.loadUser(userRequest);

            AppUser user = appUserRepository.findById(githubUser.getName())
                    .orElseGet(() -> {
                        AppUser newUser = new AppUser(
                                githubUser.getName(),
                                githubUser.getAttribute("login"),
                                githubUser.getAttribute("name"),
                                githubUser.getAttribute("avatar_url"),
                                githubUser.getAttribute("html_url"),
                                Collections.emptyList()
                        );
                        // hier kannst du die Rolle des Users setzen, z.B. "ROLE_USER"
                        return appUserRepository.save(newUser);
                    });
            return githubUser;
        };
    }

}
