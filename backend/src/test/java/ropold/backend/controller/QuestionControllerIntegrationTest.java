package ropold.backend.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import ropold.backend.model.AppUser;
import ropold.backend.model.CategoryEnum;
import ropold.backend.model.QuestionModel;
import ropold.backend.repository.AppUserRepository;
import ropold.backend.repository.QuestionRepository;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;


@SpringBootTest
@AutoConfigureMockMvc
class QuestionControllerIntegrationTest {

    @MockBean
    private Cloudinary cloudinary;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @BeforeEach
    void setUp() {
        questionRepository.deleteAll();
        appUserRepository.deleteAll();

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
                false,
                "user",
                "https://example.com/harrypotter.jpg"
        );

        questionRepository.saveAll(List.of(questionModel1, questionModel2));

        AppUser user = new AppUser(
                "user",
                "username",
                "Max Mustermann",
                "https://github.com/avatar",
                "https://github.com/mustermann",
                List.of("2")
        );
        appUserRepository.save(user);
    }

    @Test
    void getAllQuestions() throws Exception {
        mockMvc.perform(get("/api/word-link-hub"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].title", is("Pyramidenland")))
                .andExpect(jsonPath("$[1].title", is("Zauberschüler")));
    }

    @Test
    void getActiveQuestions() throws Exception {
        mockMvc.perform(get("/api/word-link-hub/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Pyramidenland")));
    }

    @Test
    void getQuestionById() throws Exception {
        mockMvc.perform(get("/api/word-link-hub/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Pyramidenland")))
                .andExpect(jsonPath("$.categoryEnum", is("GEOGRAPHY")));
    }

    @Test
    void postQuestion_shouldReturnCreatedQuestion() throws Exception {
        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getName()).thenReturn("user");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(mockOAuth2User, null,
                        Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")))
        );

        questionRepository.deleteAll();

        Uploader mockUploader = mock(Uploader.class);
        when(mockUploader.upload(any(), anyMap())).thenReturn(Map.of("secure_url", "https://www.test.de/"));
        when(cloudinary.uploader()).thenReturn(mockUploader);

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/word-link-hub")
                        .file(new MockMultipartFile("image", "image.jpg", "image/jpeg", "image".getBytes()))
                        .file(new MockMultipartFile("questionModelDto", "", "application/json", """
                {
                    "title": "Berühmter Apfel",
                    "categoryEnum": "SCIENCE",
                    "clueWords": ["Gravitation", "Newton", "Fall", "Baum"],
                    "solutionWord": "Apfel",
                    "answerExplanation": "Die Hinweise beziehen sich auf die Anekdote, wie Isaac Newton durch einen fallenden Apfel zur Gravitationstheorie inspiriert wurde.",
                    "isActive": true,
                    "githubId": "user",
                    "imageUrl": "https://example.com/newton.jpg"
                }
                """.getBytes())))
                .andExpect(status().isCreated());

        List<QuestionModel> allQuestions = questionRepository.findAll();
        Assertions.assertEquals(1, allQuestions.size());

        QuestionModel savedQuestion = allQuestions.getFirst();
        org.assertj.core.api.Assertions.assertThat(savedQuestion)
                .usingRecursiveComparison()
                .ignoringFields("id", "imageUrl")
                .isEqualTo(new QuestionModel(
                        null,
                        "Berühmter Apfel",
                        CategoryEnum.SCIENCE,
                        List.of("Gravitation", "Newton", "Fall", "Baum"),
                        "Apfel",
                        "Die Hinweise beziehen sich auf die Anekdote, wie Isaac Newton durch einen fallenden Apfel zur Gravitationstheorie inspiriert wurde.",
                        true,
                        "user",
                        null
                ));
    }

    @Test
    void postQuestionWithoutLogin_shouldReturnCreatedQuestion() throws Exception {
        questionRepository.deleteAll();

        String json =     """  
                {
                    "title": "Berühmter Apfel",
                    "categoryEnum": "SCIENCE",
                    "clueWords": ["Gravitation", "Newton", "Fall", "Baum"],
                    "solutionWord": "Apfel",
                    "answerExplanation": "Die Hinweise beziehen sich auf die Anekdote, wie Isaac Newton durch einen fallenden Apfel zur Gravitationstheorie inspiriert wurde.",
                    "isActive": true,
                    "githubId": "anonymous"
                }
                """;

        mockMvc.perform(MockMvcRequestBuilders.post("/api/word-link-hub/no-login")
                        .contentType("application/json")
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("Berühmter Apfel")))
                .andExpect(jsonPath("$.categoryEnum", is("SCIENCE")))
                .andExpect(jsonPath("$.clueWords", hasSize(4)))
                .andExpect(jsonPath("$.clueWords[0]", is("Gravitation")))
                .andExpect(jsonPath("$.solutionWord", is("Apfel")))
                .andExpect(jsonPath("$.answerExplanation", is("Die Hinweise beziehen sich auf die Anekdote, wie Isaac Newton durch einen fallenden Apfel zur Gravitationstheorie inspiriert wurde.")))
                .andExpect(jsonPath("$.githubId").value("anonymous"))
                .andExpect(jsonPath("$.imageUrl").doesNotExist());

        List<QuestionModel> allQuestions = questionRepository.findAll();
        Assertions.assertEquals(1, allQuestions.size());

        QuestionModel savedQuestion = allQuestions.getFirst();
        org.assertj.core.api.Assertions.assertThat(savedQuestion)
                .usingRecursiveComparison()
                .ignoringFields("id", "imageUrl")
                .isEqualTo(new QuestionModel(
                        null,
                        "Berühmter Apfel",
                        CategoryEnum.SCIENCE,
                        List.of("Gravitation", "Newton", "Fall", "Baum"),
                        "Apfel",
                        "Die Hinweise beziehen sich auf die Anekdote, wie Isaac Newton durch einen fallenden Apfel zur Gravitationstheorie inspiriert wurde.",
                        true,
                        "anonymous",
                        null
                ));

    }

    @Test
    void updateWithPut_shouldReturnUpdatedQuestion() throws Exception {
        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getName()).thenReturn("user");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(mockOAuth2User, null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
        );

        Uploader mockUploader = mock(Uploader.class);
        when(mockUploader.upload(any(), anyMap())).thenReturn(Map.of("secure_url", "https://example.com/updated-image.jpg"));
        when(cloudinary.uploader()).thenReturn(mockUploader);

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/word-link-hub/1")
                        .file(new MockMultipartFile("image", "image.jpg", "image/jpeg", "image".getBytes()))
                        .file(new MockMultipartFile("questionModelDto", "", "application/json", """
                                {
                                    "title": "Aktualisierter Titel",
                                    "categoryEnum": "GEOGRAPHY",
                                    "clueWords": ["Wüste", "Kamel", "Nil", "Pharao"],
                                    "solutionWord": "Ägypten",
                                    "answerExplanation": "Aktualisierte Antworterklärung.",
                                    "isActive": true,
                                    "githubId": "user",
                                    "imageUrl": null
                                }
                                """.getBytes()))
                        .contentType("multipart/form-data")
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Aktualisierter Titel")))
                .andExpect(jsonPath("$.categoryEnum", is("GEOGRAPHY")))
                .andExpect(jsonPath("$.clueWords", hasSize(4)))
                .andExpect(jsonPath("$.clueWords[0]", is("Wüste")))
                .andExpect(jsonPath("$.solutionWord", is("Ägypten")))
                .andExpect(jsonPath("$.answerExplanation", is("Aktualisierte Antworterklärung.")))
                .andExpect(jsonPath("$.githubId", is("user")))
                .andExpect(jsonPath("$.imageUrl", is("https://example.com/updated-image.jpg")));

        QuestionModel updatedQuestion = questionRepository.findById("1").orElseThrow();
        Assertions.assertEquals("Aktualisierter Titel", updatedQuestion.title());
    }

    @Test
    void deleteQuestion_shouldReturnNoContent() throws Exception {
        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getName()).thenReturn("user");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(mockOAuth2User, null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
        );

        Uploader mockUploader = mock(Uploader.class);
        when(mockUploader.upload(any(), anyMap())).thenReturn(Map.of("secure_url", "https://example.com/updated-image.jpg"));
        when(cloudinary.uploader()).thenReturn(mockUploader);

        mockMvc.perform(MockMvcRequestBuilders.delete("/api/word-link-hub/1"))
                .andExpect(status().isNoContent());

        Assertions.assertFalse(questionRepository.existsById("1"));
    }

    @Test
    void updateQuestion_withoutImage_shouldSetImageUrlNull() throws Exception {
        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getName()).thenReturn("user");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(mockOAuth2User, null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
        );

        Uploader mockUploader = mock(Uploader.class);
        when(mockUploader.upload(any(), anyMap())).thenReturn(Map.of("secure_url", "https://example.com/updated-image.jpg"));
        when(cloudinary.uploader()).thenReturn(mockUploader);

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/word-link-hub/1")
                        .file(new MockMultipartFile("questionModelDto", "", "application/json", """
                                {
                                    "title": "Aktualisierter Titel",
                                    "categoryEnum": "GEOGRAPHY",
                                    "clueWords": ["Wüste", "Kamel", "Nil", "Pharao"],
                                    "solutionWord": "Ägypten",
                                    "answerExplanation": "Aktualisierte Antworterklärung.",
                                    "isActive": true,
                                    "githubId": "user",
                                    "imageUrl": null
                                }
                                """.getBytes()))
                        .contentType("multipart/form-data")
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl").value(Matchers.nullValue()));

        QuestionModel updated = questionRepository.findById("1").orElseThrow();
        Assertions.assertNull(updated.imageUrl());
    }

    @Test
    void updateQuestion_withExistingImageUrl_shouldKeepOldImageUrl() throws Exception {
        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getName()).thenReturn("user");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(mockOAuth2User, null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
        );

        Uploader mockUploader = mock(Uploader.class);
        when(mockUploader.upload(any(), anyMap())).thenReturn(Map.of("secure_url", "https://example.com/image.jpg"));
        when(cloudinary.uploader()).thenReturn(mockUploader);

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/word-link-hub/1")
                // Kein 'image' File, um den else-Zweig zu triggern
                .file(new MockMultipartFile("questionModelDto", "", "application/json", """
                    {
                        "title": "Aktualisierter Titel",
                        "categoryEnum": "GEOGRAPHY",
                        "clueWords": ["Wüste", "Kamel", "Nil", "Pharao"],
                        "solutionWord": "Ägypten",
                        "answerExplanation": "Aktualisierte Antworterklärung.",
                        "isActive": true,
                        "githubId": "user",
                        "imageUrl": "https://example.com/old-image.jpg"
                    }
                    """.getBytes()))
                .contentType("multipart/form-data")
                .with(request -> {
                    request.setMethod("PUT");
                    return request;
                }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl").value("https://example.com/egypt.jpg"))
                .andExpect(jsonPath("$.title", is("Aktualisierter Titel")));

        QuestionModel updated = questionRepository.findById("1").orElseThrow();
        Assertions.assertEquals("https://example.com/egypt.jpg", updated.imageUrl());
    }

}
