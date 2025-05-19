package dit.hua.gr.backend.service;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class FileStorageServiceTest {

    @Mock
    private MinioClient minioClient;

    @InjectMocks
    private FileStorageService fileStorageService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testStoreFile() throws Exception {
        // Arrange
        String bucketName = "test-bucket";
        String fileName = "test-file.pdf";
        byte[] content = "test content".getBytes();
        
        MultipartFile file = new MockMultipartFile(
            "file", 
            fileName,
            "application/pdf", 
            content
        );
        
        // Configure the service to use the test bucket
        fileStorageService.setBucketName(bucketName);
        
        // Mock the MinioClient behavior
        doNothing().when(minioClient).putObject(any(PutObjectArgs.class));

        // Act
        String result = fileStorageService.storeFile(file);

        // Assert
        assertEquals(fileName, result);
        verify(minioClient, times(1)).putObject(any(PutObjectArgs.class));
    }

    @Test
    void testGetFileUrl() throws Exception {
        // Arrange
        String bucketName = "test-bucket";
        String fileName = "test-file.pdf";
        String expectedUrl = "http://minio-server/test-bucket/test-file.pdf";
        
        // Configure the service to use the test bucket
        fileStorageService.setBucketName(bucketName);
        
        // Mock the MinioClient behavior
        when(minioClient.getPresignedObjectUrl(any())).thenReturn(expectedUrl);

        // Act
        String result = fileStorageService.getFileUrl(fileName);

        // Assert
        assertEquals(expectedUrl, result);
    }
} 