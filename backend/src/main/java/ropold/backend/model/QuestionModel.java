package ropold.backend.model;

import java.util.List;

public record QuestionModel(
        String id,
        String title,
        CategoryEnum categoryEnum,
        List<String> clueWords,
        String solutionWord,
        String answerExplanation,
        boolean isActive,
        String githubId,
        String imageUrl
) {
}
