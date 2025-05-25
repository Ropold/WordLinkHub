package ropold.backend.service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ropold.backend.model.HighScoreModel;
import ropold.backend.repository.HighScoreRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HighScoreService {

    private final HighScoreRepository highScoreRepository;
    private final IdService idService;

    public List<HighScoreModel> getAllHighScores() {
        return highScoreRepository.findAllByOrderByWrongAnswerCountAscScoreTimeAsc();
    }

    public HighScoreModel addHighScore(@Valid HighScoreModel highScoreModel) {
        HighScoreModel newHighScoreModel = new HighScoreModel(
                idService.generateRandomId(),
                highScoreModel.playerName(),
                highScoreModel.githubId(),
                highScoreModel.categoryEnum(),
                highScoreModel.wrongAnswerCount(),
                highScoreModel.scoreTime(),
                highScoreModel.date()
        );

        List<HighScoreModel> existingScores = highScoreRepository
                .findAllByOrderByWrongAnswerCountAscScoreTimeAsc();

        if (existingScores.size() < 10) {
            return highScoreRepository.save(newHighScoreModel);
        }

        HighScoreModel worstScore = existingScores.get(9); // Platz 10

        boolean isWorse =
                newHighScoreModel.wrongAnswerCount() > worstScore.wrongAnswerCount() ||
                        (newHighScoreModel.wrongAnswerCount() == worstScore.wrongAnswerCount() &&
                                newHighScoreModel.scoreTime() >= worstScore.scoreTime());

        if (isWorse) {
            return null; // Neuer Score ist schlechter oder gleich → nicht speichern
        }

        // Neuer Score ist besser → alten entfernen und neuen speichern
        highScoreRepository.delete(worstScore);
        return highScoreRepository.save(newHighScoreModel);
    }


    public void deleteHighScore(String id) {
        highScoreRepository.deleteById(id);
    }
}
