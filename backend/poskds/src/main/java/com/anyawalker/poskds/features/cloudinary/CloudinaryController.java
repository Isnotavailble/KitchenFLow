package com.anyawalker.poskds.features.cloudinary;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("api/images")
public class CloudinaryController {
    private final CloudinaryService cloudinaryService;

    @Value("${CLOUDINARY_FOLDER}")
    private String folderPath;

    public CloudinaryController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file,
                                         @RequestParam("resize") boolean resize) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
        }
        try {

            Map<String, Object> result = resize ?
                    cloudinaryService.uploadAndResizeImage(file,folderPath,800,600) :
                    cloudinaryService.uploadImage(file, folderPath);


            return ResponseEntity.ok(new UploadResponse(
                    (String) result.get("secure_url"),
                    (String) result.get("public_id")
            ));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Image upload failed: " + e.getMessage()));
        }
    }
    @DeleteMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteImage(@RequestParam String id){
        if (id == null || id.isBlank())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error","Invalid Image ID"));
        try {
            cloudinaryService.deleteImage(id);

            return ResponseEntity.ok(Map.of("message","Image with ID %s is deleted successfully".formatted(id)));
        }
        catch (IOException e){
            return ResponseEntity.internalServerError().body(Map.of("error", "Image upload failed: " + e.getMessage()));
        }

    }

    public record UploadResponse(String imageUrl, String imageId) {}
}
