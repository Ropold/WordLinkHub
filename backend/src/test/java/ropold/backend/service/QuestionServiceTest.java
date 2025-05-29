package ropold.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ropold.backend.model.CategoryEnum;
import ropold.backend.model.QuestionModel;
import ropold.backend.repository.QuestionRepository;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class QuestionServiceTest {

    IdService idService = mock(IdService.class);
    QuestionRepository questionRepository = mock(QuestionRepository.class);
    CloudinaryService cloudinaryService = mock(CloudinaryService.class);
    QuestionService questionService = new QuestionService(idService, questionRepository, cloudinaryService);

    List<QuestionModel> questionModels;

    @BeforeEach
    void setUp() {

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
        when(questionRepository.findAll()).thenReturn(List.of(questionModel1, questionModel2));
        questionModels = List.of(questionModel1, questionModel2);
    }

    @Test
    void testGetAllQuestions() {
        List<QuestionModel> result = questionService.getAllQuestions();
        assertEquals(questionModels, result);
    }

    @Test
    void testGetActiveQuestions() {
        List<QuestionModel> result = questionService.getActiveQuestions();
        List<QuestionModel> expected = questionModels.stream()
                .filter(QuestionModel::isActive)
                .toList();
        assertEquals(expected, result);
    }

    @Test
    void testGetQuestionById() {
        QuestionModel expected = questionModels.getFirst();
        when(questionRepository.findById("1")).thenReturn(java.util.Optional.of(expected));
        QuestionModel result = questionService.getQuestionById("1");
        assertEquals(expected, result);
    }

    @Test
    void testGetQuestionsByIds() {
        List<String> questionIds = List.of("1", "2");
        when(questionRepository.findAllById(questionIds)).thenReturn(questionModels);
        List<QuestionModel> result = questionService.getQuestionsByIds(questionIds);
        assertEquals(questionModels, result);
    }

}
