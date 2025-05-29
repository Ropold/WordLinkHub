package ropold.backend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record HighScoreModel(
        String id,
        @NotBlank(message = "Player name must not be blank")
        @Size(min = 3, message = "Name must contain at least 3 characters")
        String playerName,
        String githubId,
        String categoryEnum,
        int wrongAnswerCount,
        double scoreTime,
        @NotNull LocalDateTime date
) {
}
