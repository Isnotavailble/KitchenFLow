package com.anyawalker.poskds.features.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {
    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> uploadImage(MultipartFile file, String folder) throws IOException {
        Map<String, Object> options = Map.of(
                "folder", folder,
                "resource_type", "image"
        );
        return cloudinary.uploader().upload(file.getBytes(), options);
    }

    public void deleteImage(String publicId) throws IOException {
        if (publicId == null || publicId.isBlank()) {
            return;
        }
        Map<String, Object> options = Map.of(
                "invalidate", true, //invalidate CDN
                "resource_type", "image"
        );
        cloudinary.uploader().destroy(publicId.trim(), options);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> uploadAndResizeImage(MultipartFile multipartFile, String folder, int width, int height) throws IOException {
        Transformation<?> transformation = new Transformation<>()
                .width(width)
                .height(height)
                .crop("fill")
                .gravity("center")
                .quality(90);

        Map<String, Object> options = Map.of(
                "folder", folder,
                "resource_type", "image",
                "transformation", transformation
        );
        return cloudinary.uploader().upload(multipartFile.getBytes(), options);
    }
}
