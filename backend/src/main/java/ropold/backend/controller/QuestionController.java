package ropold.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ropold.backend.exception.QuestionNotFoundException;
import ropold.backend.model.QuestionModel;
import ropold.backend.model.QuestionModelDto;
import ropold.backend.service.CloudinaryService;
import ropold.backend.service.QuestionService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/word-link-hub")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;
    private final CloudinaryService cloudinaryService;

    @GetMapping
    public List<QuestionModel> getAllQuestions() {
        return questionService.getAllQuestions();
    }

    @GetMapping("/active")
    public List<QuestionModel> getActiveQuestions() {
        return questionService.getActiveQuestions();
    }

    @GetMapping("/{id}")
    public QuestionModel getQuestionById(@PathVariable String id) {
        QuestionModel questionModel = questionService.getQuestionById(id);
        if (questionModel == null) {
            throw new QuestionNotFoundException("No Question found with id: " + id);
        }
        return questionModel;
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping()
    public QuestionModel addQuestion(
            @RequestPart("questionModelDto") @Valid QuestionModelDto questionModelDto,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal OAuth2User authentication) throws IOException {

        String authenticatedUserId = authentication.getName();

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(image);
        }

        return questionService.addQuestion(
                new QuestionModel(
                        null,
                        questionModelDto.title(),
                        questionModelDto.categoryEnum(),
                        questionModelDto.clueWords(),
                        questionModelDto.solutionWord(),
                        questionModelDto.answerExplanation(),
                        questionModelDto.isActive(),
                        authenticatedUserId,
                        imageUrl
                )
        );
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/no-login")
    public QuestionModel addQuestionWithNoLogin(
            @RequestBody QuestionModelDto questionModelDto) {

        return questionService.addQuestion(
                new QuestionModel(
                        null,
                        questionModelDto.title(),
                        questionModelDto.categoryEnum(),
                        questionModelDto.clueWords(),
                        questionModelDto.solutionWord(),
                        questionModelDto.answerExplanation(),
                        questionModelDto.isActive(),
                        questionModelDto.githubId(),
                        null
                )
        );
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/bulk")
    public List<QuestionModel> addQuestionsWithNoLogin(
            @RequestBody List<QuestionModelDto> questionModelDtos) {

        return questionModelDtos.stream()
                .map(dto -> questionService.addQuestion(
                        new QuestionModel(
                                null,
                                dto.title(),
                                dto.categoryEnum(),
                                dto.clueWords(),
                                dto.solutionWord(),
                                dto.answerExplanation(),
                                dto.isActive(),
                                dto.githubId(),
                                null
                        )
                ))
                .toList();
    }

    @PutMapping("/{id}")
    public QuestionModel updateQuestion(
            @PathVariable String id,
            @RequestPart("questionModelDto") @Valid QuestionModelDto questionModelDto,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal OAuth2User authentication) throws IOException {

        String authenticatedUserId = authentication.getName();
        QuestionModel existingQuestion = questionService.getQuestionById(id);

        if (!authenticatedUserId.equals(existingQuestion.githubId())) {
            throw new AccessDeniedException("You do not have permission to update this question.");
        }

        String newImageUrl;

        if (image != null && !image.isEmpty()) {
            newImageUrl = cloudinaryService.uploadImage(image);
        } else if (questionModelDto.imageUrl() == null || questionModelDto.imageUrl().isBlank()) {
            newImageUrl = null;
        } else {
            newImageUrl = existingQuestion.imageUrl();
        }

        QuestionModel updatedQuestion = new QuestionModel(
                id,
                questionModelDto.title(),
                questionModelDto.categoryEnum(),
                questionModelDto.clueWords(),
                questionModelDto.solutionWord(),
                questionModelDto.answerExplanation(),
                questionModelDto.isActive(),
                questionModelDto.githubId(),
                newImageUrl
        );

        return questionService.updateQuestion(updatedQuestion);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteQuestion(@PathVariable String id, @AuthenticationPrincipal OAuth2User authentication) {
        String authenticatedUserId = authentication.getName();

        QuestionModel questionModel = questionService.getQuestionById(id);
        if (!questionModel.githubId().equals(authenticatedUserId)) {
            throw new AccessDeniedException("You do not have permission to delete this Question.");
        }
        questionService.deleteQuestion(id);
    }
}
