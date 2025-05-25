package ropold.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import ropold.backend.model.HighScoreModel;

import java.util.List;

public interface HighScoreRepository extends MongoRepository<HighScoreModel,String> {

    List<HighScoreModel> findAllByOrderByWrongAnswerCountAscScoreTimeAsc();

}
