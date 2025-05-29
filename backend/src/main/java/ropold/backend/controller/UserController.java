package ropold.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import ropold.backend.exception.AccessDeniedException;
import ropold.backend.model.QuestionModel;
import ropold.backend.service.AppUserService;
import ropold.backend.service.QuestionService;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final QuestionService questionService;
    private final AppUserService appUserService;

    @GetMapping(value = "/me", produces = "text/plain")
    public String getMe() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/me/details")
    public Map<String, Object> getUserDetails(@AuthenticationPrincipal OAuth2User user) {
        if (user == null) {
            return Map.of("message", "User not authenticated");
        }
        return user.getAttributes();
    }

    @GetMapping("/favorites")
    public List<QuestionModel> getUserFavorites(@AuthenticationPrincipal OAuth2User authentication) {
        List<String> favoritePieceImageIds = appUserService.getUserFavoriteQuestions(authentication.getName());
        return questionService.getQuestionsByIds(favoritePieceImageIds);
    }

    @GetMapping("/me/my-questions/{githubId}")
    public List<QuestionModel> getQuestionsForGithubUser(@PathVariable String githubId) {
        return questionService.getQuestionsForGithubUser(githubId);
    }

    @PostMapping("/favorites/{questionId}")
    @ResponseStatus(HttpStatus.CREATED)
    public void addQuestionToFavorites(@PathVariable String questionId, @AuthenticationPrincipal OAuth2User authentication) {
        String authenticatedUserId = authentication.getName();
        appUserService.addQuestionToFavoriteQuestions(authenticatedUserId, questionId);
    }

    @DeleteMapping("/favorites/{questionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeQuestionFromFavorites(@PathVariable String questionId, @AuthenticationPrincipal OAuth2User authentication) {
        String authenticatedUserId = authentication.getName();
        appUserService.removeQuestionFromFavoriteQuestions(authenticatedUserId, questionId);
    }

    @PutMapping("/{id}/toggle-active")
    public QuestionModel toggleQuestionActive(@PathVariable String id, @AuthenticationPrincipal OAuth2User authentication) {
        String authenticatedUserId = authentication.getName();

        QuestionModel questionModel = questionService.getQuestionById(id);
        if (!questionModel.githubId().equals(authenticatedUserId)) {
            throw new AccessDeniedException("You do not have permission to toggle this animal.");
        }
        return questionService.toggleQuestionActive(id);

    }


}
