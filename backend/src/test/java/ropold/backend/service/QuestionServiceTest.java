package ropold.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ropold.backend.model.CategoryEnum;
import ropold.backend.model.QuestionModel;
import ropold.backend.repository.QuestionRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.times;

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

    @Test
    void testAddQuestion() {
        QuestionModel questionModel3 = new QuestionModel(
                "3",
                "Testfrage",
                CategoryEnum.ART,
                List.of("Antwort1", "Antwort2", "Antwort3", "Antwort4"),
                "Richtige Antwort",
                "Erklärung zur richtigen Antwort",
                true,
                "user",
                null
        );
        when(idService.generateRandomId()).thenReturn("3");
        when(questionRepository.save(questionModel3)).thenReturn(questionModel3);

        QuestionModel expected = questionService.addQuestion(questionModel3);

        assertEquals(questionModel3, expected);
        verify(idService, times(1)).generateRandomId();
        verify(questionRepository, times(1)).save(questionModel3);
    }

    @Test
    void testUpdateQuestion(){
        QuestionModel updatedQuestionModel = new QuestionModel(
                "1",
                "Aktualisierte Frage",
                CategoryEnum.ART,
                List.of("Aktualisierte Antwort1", "Aktualisierte Antwort2", "Aktualisierte Antwort3", "Aktualisierte Antwort4"),
                "Aktualisierte Antwort",
                "Aktualisierte Erklärung",
                true,
                "user",
                "https://example.com/updated.jpg"
        );

        when(questionRepository.findById("1")).thenReturn(Optional.of(updatedQuestionModel));
        when(questionRepository.save(updatedQuestionModel)).thenReturn(updatedQuestionModel);

        QuestionModel result = questionService.updateQuestion(updatedQuestionModel);

        assertEquals(updatedQuestionModel, result);

        verify(questionRepository, times(1)).save(updatedQuestionModel);
    }

    @Test
    void testDeleteQuestion() {
        QuestionModel questionModel = questionModels.getFirst();
        when(questionRepository.findById("1")).thenReturn(java.util.Optional.of(questionModel));
        questionService.deleteQuestion("1");
        verify(questionRepository, times(1)).deleteById("1");
        verify(cloudinaryService, times(1)).deleteImage(questionModel.imageUrl());
    }

    @Test
    void testGetQuestionsForGithubUser() {
        String githubId = "user";
        List<QuestionModel> expectedQuestions = questionModels.stream()
                .filter(questionModel -> questionModel.githubId().equals(githubId))
                .toList();

        when(questionRepository.findAll()).thenReturn(questionModels);

        List<QuestionModel> result = questionService.getQuestionsForGithubUser(githubId);

        assertEquals(expectedQuestions, result);
        verify(questionRepository, times(1)).findAll();
    }

    @Test
    void testToggleQuestionActive() {
        QuestionModel questionModel = questionModels.getFirst();
        when(questionRepository.findById("1")).thenReturn(Optional.of(questionModel));

        QuestionModel updatedQuestionModel = new QuestionModel(
                questionModel.id(),
                questionModel.title(),
                questionModel.categoryEnum(),
                questionModel.clueWords(),
                questionModel.solutionWord(),
                questionModel.answerExplanation(),
                !questionModel.isActive(),
                questionModel.githubId(),
                questionModel.imageUrl()
        );

        when(questionRepository.findById("1")).thenReturn(Optional.of(questionModel));
        when(questionRepository.save(any(QuestionModel.class))).thenReturn(updatedQuestionModel);

        QuestionModel expected = questionService.toggleQuestionActive("1");

        //then
        assertEquals(updatedQuestionModel, expected);
        verify(questionRepository, times(1)).findById("1");
        verify(questionRepository, times(1)).save(updatedQuestionModel);
    }
}
