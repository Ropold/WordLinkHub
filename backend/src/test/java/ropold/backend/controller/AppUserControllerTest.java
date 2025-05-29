package ropold.backend.controller;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import ropold.backend.model.AppUser;
import ropold.backend.model.CategoryEnum;
import ropold.backend.model.QuestionModel;
import ropold.backend.repository.AppUserRepository;
import ropold.backend.repository.QuestionRepository;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AppUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @BeforeEach
    void setUp() {
        appUserRepository.deleteAll();
        questionRepository.deleteAll();

        AppUser user = new AppUser(
                "user",
                "username",
                "Max Mustermann",
                "https://github.com/avatar",
                "https://github.com/mustermann",
                List.of("2")
        );
        appUserRepository.save(user);

        QuestionModel questionModel1 = new QuestionModel(
                "1",
                "Pyramidenland",
                CategoryEnum.GEOGRAPHY,
                List.of("Wüste", "Kamel", "Nil", "Pharao"),
                "Ägypten",
                "Die Hinweise deuten auf Ägypten – bekannt für seine Wüste, den Nil und die Pyramiden.",
                true,
                "user",
                "https://example.com/egypt.jpg"
        );

        QuestionModel questionModel2 = new QuestionModel(
                "2",
                "Zauberschüler",
                CategoryEnum.FICTIONAL_CHARACTERS,
                List.of("Hogwarts", "Zauberstab", "Narbe", "Brille"),
                "Harry Potter",
                "Alle Begriffe beziehen sich auf den berühmten Zauberschüler aus der gleichnamigen Buchreihe.",
                true,
                "user",
                "https://example.com/harrypotter.jpg"
        );

        questionRepository.saveAll(List.of(questionModel1, questionModel2));
    }

    @Test
    void testGetMe_withLoggedInUser_expectUsername() throws Exception {
        OAuth2User mockUser = mock(OAuth2User.class);
        when(mockUser.getName()).thenReturn("user");

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        Authentication authentication = new UsernamePasswordAuthenticationToken(mockUser, null, mockUser.getAuthorities());
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isOk())
                .andExpect(content().string("user"));
    }

    @Test
    void testGetMe_withoutLogin_expectAnonymousUsername() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isOk())
                .andExpect(content().string("anonymousUser"));
    }

    @Test
    void testGetUserDetails_withLoggedInUser_expectUserDetails() throws Exception {
        // Erstellen eines Mock OAuth2User
        OAuth2User mockUser = mock(OAuth2User.class);
        when(mockUser.getAttributes()).thenReturn(Map.of(
                "login", "username",
                "name", "max mustermann",
                "avatar_url", "https://github.com/avatar",
                "html_url", "https://github.com/mustermann"
        ));

        // Simuliere den OAuth2User in der SecurityContext
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        Authentication authentication = new UsernamePasswordAuthenticationToken(mockUser, null, mockUser.getAuthorities());
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        mockMvc.perform(get("/api/users/me/details"))
                .andExpect(status().isOk())
                .andExpect(content().json("""
                {
                    "login": "username",
                    "name": "max mustermann",
                    "avatar_url": "https://github.com/avatar",
                    "html_url": "https://github.com/mustermann"
                }
            """));
    }

    @Test
    void testGetUserDetails_withoutLogin_expectErrorMessage() throws Exception {
        mockMvc.perform(get("/api/users/me/details"))
                .andExpect(status().isOk())
                .andExpect(content().json("""
                {
                    "message": "User not authenticated"
                }
            """));
    }

    @Test
    void TestGetUserFavorites_ShouldReturnUserFavorites() throws Exception {
        mockMvc.perform(
                        MockMvcRequestBuilders.get("/api/users/me/my-questions/user")
                                .with(oidcLogin().idToken(i -> i.claim("sub", "user")))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].githubId").value("user"))
                .andExpect(jsonPath("$[1].githubId").value("user"));
        }

    @Test
    @WithMockUser(username = "user")
    void getUserFavorites_shouldReturnUserFavorites() throws Exception {
        mockMvc.perform(
                        MockMvcRequestBuilders.get("/api/users/favorites")
                                .with(oidcLogin().idToken(i -> i.claim("sub", "user")))
                )
                .andExpect(status().isOk())
                .andExpect(content().json("""
            [
                {
                    "id": "2",
                    "title": "Zauberschüler",
                    "categoryEnum": "FICTIONAL_CHARACTERS",
                    "clueWords": [
                        "Hogwarts",
                        "Zauberstab",
                        "Narbe",
                        "Brille"
                    ],
                    "solutionWord": "Harry Potter",
                    "answerExplanation": "Alle Begriffe beziehen sich auf den berühmten Zauberschüler aus der gleichnamigen Buchreihe.",
                    "isActive": true,
                    "githubId": "user",
                    "imageUrl": "https://example.com/harrypotter.jpg"
                }
            ]
        """));
    }

    @Test
    void addQuestionToFavorites_shouldAddQuestionAndReturnFavorites() throws Exception {
        AppUser userBefore = appUserRepository.findById("user").orElseThrow();
        Assertions.assertFalse(userBefore.favoriteQuestions().contains("1"));

        mockMvc.perform(MockMvcRequestBuilders.post("/api/users/favorites/1")
                        .with(oidcLogin().idToken(i -> i.claim("sub", "user"))))
                .andExpect(status().isCreated());

        AppUser updatedUser = appUserRepository.findById("user").orElseThrow();
        Assertions.assertTrue(updatedUser.favoriteQuestions().contains("1"));
    }

    @Test
    void removeQuestionFromFavorites_shouldRemoveQuestionAndReturnFavorites() throws Exception {
        AppUser userBefore = appUserRepository.findById("user").orElseThrow();
        Assertions.assertTrue(userBefore.favoriteQuestions().contains("2"));

        mockMvc.perform(MockMvcRequestBuilders.delete("/api/users/favorites/2")
                        .with(oidcLogin().idToken(i -> i.claim("sub", "user")))
                )
                .andExpect(status().isNoContent()); // .isOk = 200, .isNoContent = 204

        AppUser updatedUser = appUserRepository.findById("user").orElseThrow();
        Assertions.assertFalse(updatedUser.favoriteQuestions().contains("2"));
    }

    @Test
    void ToggleActiveStatus_shouldToggleActiveStatus() throws Exception {
        QuestionModel memoryBefore = questionRepository.findById("1").orElseThrow();
        Assertions.assertTrue(memoryBefore.isActive());

        mockMvc.perform(MockMvcRequestBuilders.put("/api/users/1/toggle-active")
                        .with(oidcLogin().idToken(i -> i.claim("sub", "user")))
                )
                .andExpect(status().isOk());

        QuestionModel updatedMemory = questionRepository.findById("1").orElseThrow();
        Assertions.assertFalse(updatedMemory.isActive());
    }
}
