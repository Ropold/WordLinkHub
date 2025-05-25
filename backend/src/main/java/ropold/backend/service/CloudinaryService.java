package ropold.backend.service;

import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Collections;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile image) throws IOException {
        File fileToUpload = File.createTempFile("quiz-hub", "");
        image.transferTo(fileToUpload);

        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = cloudinary.uploader().upload(fileToUpload, Collections.emptyMap());
        return uploadResult.get("secure_url").toString();
    }

    private String extractPublicIdFromUrl(String url) {
        String[] parts = url.split("/");
        return parts[parts.length - 1].split("\\.")[0];
    }

    public void deleteImage(String imageUrl) {
        String publicId = extractPublicIdFromUrl(imageUrl);

        try {
            cloudinary.uploader().destroy(publicId, Collections.emptyMap());
        } catch (IOException e) {
            throw new RuntimeException("Error deleting image from Cloudinary: " + publicId, e);
        }
    }
}
