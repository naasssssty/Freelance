package dit.hua.gr.backend.service;

import io.minio.*;
import io.minio.errors.*;
import io.minio.messages.Item;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import javax.annotation.PostConstruct;

@Service
public class MinioService {

    private static final Logger logger = LoggerFactory.getLogger(MinioService.class);

    @Autowired
    private MinioClient minioClient;

    @Value("${minio.bucket.name}")
    private String defaultBucketName;

    @Autowired
    private Environment environment;

    public MinioService(MinioClient minioClient, Environment environment) {
        this.minioClient = minioClient;
        this.environment = environment;
    }

    @PostConstruct
    public void init() {
        // Παράκαμψη αρχικοποίησης MinIO αν το active profile είναι test
        if (Arrays.asList(environment.getActiveProfiles()).contains("test")) {
            logger.info("MinIO initialization skipped for test profile");
            return;
        }

        try {
            boolean isBucketExists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(defaultBucketName).build());
            if (isBucketExists) {
                logger.info("Bucket {} already exists.", defaultBucketName);
            } else {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(defaultBucketName).build());
                logger.info("Bucket {} created successfully.", defaultBucketName);
            }
        } catch (MinioException | IOException | NoSuchAlgorithmException | InvalidKeyException e) {
            logger.error("Error initializing MinIO bucket", e);
            throw new RuntimeException("Error initializing MinIO bucket", e);
        }
    }

    /**
     * Ανέβασμα αρχείου στο MinIO
     */
    public String uploadFile(MultipartFile file, String username, Integer projectId) {
        try {
            // Create a unique file name
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String objectName = username + "/" + projectId + "/" + UUID.randomUUID() + extension;

            // Upload the file to MinIO
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(defaultBucketName)
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
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(defaultBucketName)
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
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(defaultBucketName)
                            .object(objectName)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Error deleting file from MinIO", e);
        }
    }
}