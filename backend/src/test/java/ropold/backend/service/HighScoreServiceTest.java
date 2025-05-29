package ropold.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ropold.backend.model.CategoryEnum;
import ropold.backend.model.HighScoreModel;
import ropold.backend.repository.HighScoreRepository;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;


class HighScoreServiceTest {

    IdService idService = mock(IdService.class);
    HighScoreRepository highScoreRepository = mock(HighScoreRepository.class);
    HighScoreService highScoreService = new HighScoreService(highScoreRepository, idService);

    HighScoreModel highScoreModel1 = new HighScoreModel(
            "1",
            "player1",
            "123456",
            "ART",
            0,
            10.2,
            LocalDateTime.of(2025, 3, 5, 12, 0, 0)
    );

    HighScoreModel highScoreModel2 = new HighScoreModel(
            "2",
            "player1",
            "123456",
            "ART",
            0,
            14.5,
            LocalDateTime.of(2025, 3, 5, 11, 55, 0)
    );
    List<HighScoreModel> highScores = List.of(highScoreModel1, highScoreModel2);

    @BeforeEach
    void setup() {
        highScoreRepository.deleteAll();
        highScoreRepository.saveAll(highScores);
    }

    @Test
    void getHighScores_shouldReturnHighScores() {
        // Given
        when(highScoreRepository.findAllByOrderByWrongAnswerCountAscScoreTimeAsc()).thenReturn(List.of(highScoreModel1, highScoreModel2));

        List<HighScoreModel> expected = highScoreService.getAllHighScores();

        assertEquals(expected, List.of(highScoreModel1, highScoreModel2));
    }

    @Test
    void deleteHighScore_shouldDeleteHighScore() {
        highScoreService.deleteHighScore("1");
        verify(highScoreRepository, times(1)).deleteById("1");
    }


    @Test
    void addHighScore_whenOnlyTwoHighScoresAreInRepo() {

        when(idService.generateRandomId()).thenReturn("3");
        when(highScoreRepository.findAllByOrderByWrongAnswerCountAscScoreTimeAsc()).thenReturn(highScores);

        HighScoreModel newHighScore = new HighScoreModel(
                "3",
                "player3",
                "654321",
                "ART",
                0,
                9.5,
                LocalDateTime.of(2025, 3, 5, 12, 5, 0)
        );

        when(highScoreRepository.save(any(HighScoreModel.class))).thenReturn(newHighScore);

        HighScoreModel result = highScoreService.addHighScore(newHighScore);

        assertNotNull(result);
        assertEquals("3", result.id());
        assertEquals("player3", result.playerName());
        assertEquals(9.5, result.scoreTime(), 0.1);
    }

    @Test
    void addHighScore_shouldDeleteWorstHighScore_whenNewHighScoreIsBetterThanWorst(){
        LocalDateTime fixedDate = LocalDateTime.of(2025, 3, 5, 12, 0, 0);

        List<HighScoreModel> existingScores = List.of(
                new HighScoreModel("1", "player1", "123456","ART",0,10.2, fixedDate),
                new HighScoreModel("2", "player1", "123456","ART",0,10.5, fixedDate),
                new HighScoreModel("3", "player1", "123456","ART",0,10.7, fixedDate),
                new HighScoreModel("4", "player1", "123456","ART",0,11.0, fixedDate),
                new HighScoreModel("5", "player1", "123456","ART",0,11.2, fixedDate),
                new HighScoreModel("6", "player1", "123456","ART",0,11.5, fixedDate),
                new HighScoreModel("7", "player1", "123456","ART",0,11.7, fixedDate),
                new HighScoreModel("8", "player1", "123456","ART",0,12.0, fixedDate),
                new HighScoreModel("9", "player1", "123456","ART",0,12.2, fixedDate),
                new HighScoreModel("10", "player1", "123456","ART",0,12.5, fixedDate)
        );

        when(highScoreRepository.findAllByOrderByWrongAnswerCountAscScoreTimeAsc()).thenReturn(existingScores);

        HighScoreModel newHighScore = new HighScoreModel(
                null,
                "player1",
                "123456",
                "ART",
                0,
                13.2,
                fixedDate
        );

        when(highScoreRepository.save(any(HighScoreModel.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        HighScoreModel result = highScoreService.addHighScore(newHighScore);

        assertNull(result);
        verify(highScoreRepository, never()).save(any());
        verify(highScoreRepository, never()).deleteById(any());
    }
}
