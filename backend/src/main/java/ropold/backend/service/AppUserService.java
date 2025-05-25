package ropold.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ropold.backend.model.AppUser;
import ropold.backend.repository.AppUserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppUserService {

    private final AppUserRepository appUserRepository;

    public AppUser getUserById(String userId) {
        return appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<String> getUserFavoriteQuestions(String userId) {
        AppUser user = getUserById(userId);
        return user.favoriteQuestions();
    }

    public void addQuestionToFavoriteQuestions(String authenticatedUserId, String questionId) {
        AppUser user = getUserById(authenticatedUserId);

        if (!user.favoriteQuestions().contains(questionId)) {
            user.favoriteQuestions().add(questionId);
            appUserRepository.save(user);
        }
    }

    public void removeQuestionFromFavoriteQuestions(String authenticatedUserId, String questionId) {
        AppUser user = getUserById(authenticatedUserId);

        if (user.favoriteQuestions().contains(questionId)) {
            user.favoriteQuestions().remove(questionId);
            appUserRepository.save(user);
        }
    }
}
