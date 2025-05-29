package ropold.backend.controller;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import ropold.backend.model.HighScoreModel;
import ropold.backend.repository.HighScoreRepository;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class HighScoreControllerIntegrationTest {

    @Autowired
    private HighScoreRepository highScoreRepository;

    @Autowired
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        highScoreRepository.deleteAll();

        LocalDateTime fixedDate = LocalDateTime.of(2025, 3, 5, 12, 0, 0);

        HighScoreModel highScoreModel1 = new HighScoreModel(
                "1", "player1", "123456", "ART", 0, 10.2, fixedDate);
        HighScoreModel highScoreModel2 = new HighScoreModel(
                "2", "player1", "123456", "ART", 0, 14.5, fixedDate.minusMinutes(5));

        highScoreRepository.saveAll(List.of(highScoreModel1, highScoreModel2));
    }

    @Test
    void getHighScoresByDifficulty_shouldReturnHighScores() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/high-score"))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.content().json("""
                    [
                        {
                            "id": "1",
                            "playerName": "player1",
                            "githubId": "123456",
                            "categoryEnum": "ART",
                            "wrongAnswerCount": 0,
                            "scoreTime": 10.2,
                            "date": "2025-03-05T12:00:00"
                        },
                        {
                            "id": "2",
                            "playerName": "player1",
                            "githubId": "123456",
                            "categoryEnum": "ART",
                            "wrongAnswerCount": 0,
                            "scoreTime": 14.5,
                            "date": "2025-03-05T11:55:00"
                        }
                    ]"""));
    }

    @Test
    void postHighScore_shouldReturnCreated() throws Exception {
        highScoreRepository.deleteAll();

        String highScoreJson = """
                {
                    "playerName": "player2",
                    "githubId": "654321",
                    "categoryEnum": "ART",
                    "wrongAnswerCount": 1,
                    "scoreTime": 12.3,
                    "date": "2025-03-05T12:00:00"
                }
                """;

        mockMvc.perform(MockMvcRequestBuilders.post("/api/high-score")
                        .contentType("application/json")
                        .content(highScoreJson))
                .andExpect(status().isCreated());

        List<HighScoreModel> allHighScores = highScoreRepository.findAll();
        Assertions.assertEquals(1, allHighScores.size());

        HighScoreModel savedHighScore = allHighScores.getFirst();

        org.assertj.core.api.Assertions.assertThat(savedHighScore)
                .usingRecursiveComparison()
                .ignoringFields("id", "date")
                .isEqualTo(new HighScoreModel(
                        null,
                        "player2",
                        "654321",
                        "ART",
                        1,
                        12.3,
                        null
                ));
    }

    @Test
    void postHighScore_withHighTime_shouldNotBeSaved_ifNotInTop10() throws Exception {

        highScoreRepository.deleteAll();

        LocalDateTime fixedDate = LocalDateTime.of(2025, 3, 5, 12, 0, 0);

        // 10 bestehende Highscores mit besserer Zeit
        for (int i = 0; i < 10; i++) {
            highScoreRepository.save(new HighScoreModel(
                    String.valueOf(i + 1),
                    "player" + i,
                    "githubId" + i,
                    "ART",
                    0,
                    10.0 + i,
                    fixedDate
            ));
        }

        String newScoreJson = """
                {
                    "playerName": "player11",
                    "githubId": "githubId11",
                    "categoryEnum": "ART",
                    "wrongAnswerCount": 0,
                    "scoreTime": 21.0,
                    "date": "2025-03-05T12:00:00"
                }
                """;

        mockMvc.perform(MockMvcRequestBuilders.post("/api/high-score")
                        .contentType("application/json")
                        .content(newScoreJson))
                .andExpect(status().isCreated())
                .andExpect(MockMvcResultMatchers.content().string(""));

        // Verifizieren: Es bleiben nur die 10 alten drin
        List<HighScoreModel> all = highScoreRepository.findAll();
        Assertions.assertEquals(10, all.size());

        boolean containsNewPlayer = all.stream()
                .anyMatch(score -> "player11".equals(score.playerName()));
        Assertions.assertFalse(containsNewPlayer);
    }

    @Test
    void deleteHighScore_shouldDeleteHighScore() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/high-score/1"))
                .andExpect(status().isNoContent());
        Assertions.assertEquals(1, highScoreRepository.count());
        Assertions.assertTrue(highScoreRepository.existsById("2"));
    }

}
