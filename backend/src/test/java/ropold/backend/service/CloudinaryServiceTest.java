package ropold.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Collections;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class CloudinaryServiceTest {

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    @InjectMocks
    private CloudinaryService cloudinaryService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(cloudinary.uploader()).thenReturn(uploader);
    }

    @Test
    void uploadImage_ValidImage_ReturnsSecureUrl() throws IOException {
        MultipartFile mockImage = mock(MultipartFile.class);
        when(mockImage.getOriginalFilename()).thenReturn("image.jpg");
        doAnswer(invocation -> {
            ((File) invocation.getArgument(0)).createNewFile();
            return null;
        }).when(mockImage).transferTo(any(File.class));

        Map<String, String> mockUploadResult = Map.of("secure_url", "https://example.com/image.jpg");
        when(uploader.upload(any(File.class), eq(Collections.emptyMap()))).thenReturn(mockUploadResult);

        assertEquals("https://example.com/image.jpg", cloudinaryService.uploadImage(mockImage));
        verify(uploader, times(1)).upload(any(File.class), eq(Collections.emptyMap()));
    }

    @Test
    void uploadImage_ThrowsIOException_ThrowsException() throws IOException {
        MultipartFile mockImage = mock(MultipartFile.class);
        when(mockImage.getOriginalFilename()).thenReturn("image.jpg");
        doThrow(IOException.class).when(mockImage).transferTo(any(File.class));

        assertThrows(IOException.class, () -> cloudinaryService.uploadImage(mockImage));
        verify(uploader, never()).upload(any(File.class), eq(Collections.emptyMap()));
    }

    @Test
    void deleteImage_ValidImageUrl_DeletesImage() throws IOException {
        String imageUrl = "https://example.com/image.jpg";
        String publicId = "image";
        when(cloudinary.uploader().destroy(publicId, Collections.emptyMap())).thenReturn(Map.of("result", "ok"));

        cloudinaryService.deleteImage(imageUrl);

        verify(cloudinary.uploader(), times(1)).destroy(publicId, Collections.emptyMap());
    }

}
