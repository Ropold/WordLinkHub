package ropold.backend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record QuestionModelDto(
        @NotBlank
        @Size(min = 3, message = "Title must be at least 3 characters long")
        String title,

        @NotNull(message = "Category is required")
        CategoryEnum categoryEnum,

        List<String> clueWords,//??

        @Size(min = 3, message = "Solution Word must be at least 3 characters long")
        String solutionWord,

        @Size(min = 3, message = "Answer Explanation must be at least 3 characters long")
        String answerExplanation,

        boolean isActive,
        String githubId,
        String imageUrl

) {
}
