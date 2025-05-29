package ropold.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ropold.backend.model.HighScoreModel;
import ropold.backend.service.HighScoreService;

import java.util.List;

@RestController
@RequestMapping("api/high-score")
@RequiredArgsConstructor
public class HighScoreController {
    private final HighScoreService highScoreService;

    @GetMapping()
    public List<HighScoreModel> getHighScoresByDifficulty() {
        return highScoreService.getAllHighScores();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping()
    public HighScoreModel addHighScore(@RequestBody @Valid HighScoreModel highScoreModel) {
        return highScoreService.addHighScore(highScoreModel);
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void deleteHighScore(@PathVariable String id) {
        highScoreService.deleteHighScore(id);
    }

}
