package ropold.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import ropold.backend.model.QuestionModel;

public interface QuestionRepository extends MongoRepository<QuestionModel, String> {
}
