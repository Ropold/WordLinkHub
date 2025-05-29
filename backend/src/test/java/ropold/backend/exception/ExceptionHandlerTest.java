package ropold.backend.exception;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import ropold.backend.repository.QuestionRepository;
import ropold.backend.service.QuestionService;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private Cloudinary cloudinary;

    @Autowired
    private QuestionRepository questionRepository;

    @MockBean
    private QuestionService questionService;

    @Test
    void whenQuestionNotFoundException_thenReturnsNotFound() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/word-link-hub/{id}", "non-existing-id"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("No Question found with id: non-existing-id"));
    }

    @Test
    @WithMockUser(username = "user")
    void postQuestion_shouldFailValidation_whenFieldsAreInvalid() throws Exception {

        questionRepository.deleteAll();

        Uploader mockUploader = mock(Uploader.class);
        when(mockUploader.upload(any(), any())).thenReturn(Map.of("secure_url", "https://example.com/image1.jpg"));
        when(cloudinary.uploader()).thenReturn(mockUploader);

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/word-link-hub")
                        .file(new MockMultipartFile("image", "image.jpg", "image/jpeg", "image".getBytes()))
                        .file(new MockMultipartFile("questionModelDto", "", "application/json", """
                        {
                            "title": "Ti",
                            "categoryEnum": "ART",
                            "clueWords": ["clue1", "clue2", "clue3"],
                            "solutionWord": "Mona Lisa",
                            "answerExplanation": "Mona Lisa is a famous painting by Leonardo da Vinci.",
                            "isActive": true,
                            "githubId": "user",
                            "imageUrl": ""
                        }
                    """.getBytes())))
                .andExpect(status().isBadRequest())
                .andExpect(MockMvcResultMatchers.content().json("""
         {"clueWords":"There must be at least 4 clue words",
         "title":"Title must be at least 3 characters long"}
         """));
    }

    @Test
    void whenRuntimeException_thenReturnsInternalServerError() throws Exception {
        when(questionService.getQuestionById(any())).thenThrow(new RuntimeException("Unexpected error"));

        mockMvc.perform(MockMvcRequestBuilders.get("/api/word-link-hub/{id}", "any-id"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("Unexpected error"));

    }
}
