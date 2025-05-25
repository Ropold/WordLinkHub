package ropold.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ropold.backend.service.CloudinaryService;
import ropold.backend.service.QuestionService;

@RestController
@RequestMapping("/api/word-link-hub")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;
    private final CloudinaryService cloudinaryService;

}
