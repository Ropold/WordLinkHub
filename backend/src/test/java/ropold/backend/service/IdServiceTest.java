package ropold.backend.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class IdServiceTest {
    IdService idService = new IdService();

    @Test
    void generateRandomId_ShouldReturnNonNullValue() {
        // When
        String randomId = idService.generateRandomId();

        // Then
        assertNotNull(randomId, "The generated ID should not be null");
    }

    @Test
    void generateRandomId_ShouldReturnUniqueValues() {
        // Given
        String randomId1 = idService.generateRandomId();
        String randomId2 = idService.generateRandomId();

        // Then
        assertNotEquals(randomId1, randomId2, "The generated IDs should be unique");
    }

    @Test
    void generateRandomId_ShouldFollowUUIDFormat() {
        // When
        String randomId = idService.generateRandomId();

        // Then
        assertTrue(randomId.matches("^[0-9a-fA-F-]{36}$"), "The generated ID should follow the UUID format");
    }
}
