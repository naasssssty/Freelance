package dit.hua.gr.backend.service;

import io.minio.*;
import io.minio.errors.*;
import io.minio.messages.Item;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class MinioService {

    @Autowired
    private MinioClient minioClient;

    @Autowired
    private Environment environment;

    @Value("${minio.bucketName}")
    private String bucketName;

    /**
     * Αρχικοποίηση του bucket αν δεν υπάρχει
     */
    public void init() {
        // Έλεγχος αν είμαστε σε περιβάλλον test
        if (isTestEnvironment()) {
            // Σε περιβάλλον test, δεν κάνουμε τίποτα
            return;
        }
        
        try {
            boolean bucketExists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!bucketExists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }
        } catch (Exception e) {
            throw new RuntimeException("Error initializing MinIO bucket", e);
        }
    }

    /**
     * Ανέβασμα αρχείου στο MinIO
     */
    public String uploadFile(MultipartFile file, String username, Integer projectId) {
        // Έλεγχος αν είμαστε σε περιβάλλον test
        if (isTestEnvironment()) {
            // Σε περιβάλλον test, επιστρέφουμε ένα dummy path
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            return username + "/" + projectId + "/" + UUID.randomUUID() + extension;
        }
        
        try {
            // Create a unique file name
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String objectName = username + "/" + projectId + "/" + UUID.randomUUID() + extension;

            // Upload the file to MinIO
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build());

            return objectName;
        } catch (Exception e) {
            throw new RuntimeException("Error uploading file to MinIO", e);
        }
    }

    /**
     * Κατέβασμα αρχείου από το MinIO
     */
    public InputStream getFile(String objectName) {
        // Έλεγχος αν είμαστε σε περιβάλλον test
        if (isTestEnvironment()) {
            // Σε περιβάλλον test, επιστρέφουμε ένα dummy InputStream
            return new ByteArrayInputStream("Test file content".getBytes());
        }
        
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving file from MinIO", e);
        }
    }

    /**
     * Διαγραφή αρχείου από το MinIO
     */
    public void deleteFile(String objectName) {
        // Έλεγχος αν είμαστε σε περιβάλλον test
        if (isTestEnvironment()) {
            // Σε περιβάλλον test, δεν κάνουμε τίποτα
            return;
        }
        
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Error deleting file from MinIO", e);
        }
    }
    
    /**
     * Έλεγχος αν είμαστε σε περιβάλλον test
     */
    private boolean isTestEnvironment() {
        String[] activeProfiles = environment.getActiveProfiles();
        return Arrays.asList(activeProfiles).contains("test");
    }
}