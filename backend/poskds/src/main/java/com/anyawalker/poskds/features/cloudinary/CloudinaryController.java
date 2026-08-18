package com.anyawalker.poskds.features.cloudinary;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("api/uploads")
public class CloudinaryController {
    private final CloudinaryService cloudinaryService;

    @Value("${CLOUDINARY_FOLDER}")
    private String folderPath;

    public CloudinaryController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
        }
        try {
            Map<String, Object> result = cloudinaryService.uploadImage(file, folderPath);
            return ResponseEntity.ok(new UploadResponse(
                    (String) result.get("secure_url"),
                    (String) result.get("public_id")
            ));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Image upload failed: " + e.getMessage()));
        }
    }

    public record UploadResponse(String imageUrl, String imageId) {}
}
