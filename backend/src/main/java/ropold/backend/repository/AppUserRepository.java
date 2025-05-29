package ropold.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import ropold.backend.model.AppUser;

public interface AppUserRepository extends MongoRepository<AppUser, String> {
}
