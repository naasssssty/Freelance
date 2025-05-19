package dit.hua.gr.backend.service;

import io.minio.GetObjectResponse;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.GetObjectArgs;
import io.minio.errors.MinioException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class MinioServiceTest {

    @Mock
    private MinioClient minioClient;

    @InjectMocks
    private MinioService minioService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // Χρησιμοποιούμε το ReflectionTestUtils για να ορίσουμε το bucketName
        ReflectionTestUtils.setField(minioService, "bucketName", "test-bucket");
    }

    @Test
    void testUploadFile() throws Exception {
        // Arrange
        String fileName = "test-file.txt";
        String contentType = "text/plain";
        byte[] content = "Hello, World!".getBytes();
        
        MultipartFile file = new MockMultipartFile(fileName, fileName, contentType, content);
        String projectId = "project123";
        Integer userId = 1;
        
        // Κάνουμε mock τη μέθοδο putObject
        doNothing().when(minioClient).putObject(any());
        
        // Act & Assert
        assertDoesNotThrow(() -> minioService.uploadFile(file, projectId, userId));
    }

    @Test
    void testGetFile() throws Exception {
        // Arrange
        String fileName = "test-file.txt";
        byte[] content = "Hello, World!".getBytes();
        InputStream inputStream = new ByteArrayInputStream(content);
        GetObjectResponse response = mock(GetObjectResponse.class);
        
        when(minioClient.getObject(any(GetObjectArgs.class))).thenReturn(response);
        when(response.readAllBytes()).thenReturn(content);
        
        // Act
        InputStream result = minioService.getFile(fileName);
        
        // Assert
        assertNotNull(result);
    }

    @Test
    void testUploadFileThrowsException() throws Exception {
        // Arrange
        String fileName = "test-file.txt";
        String contentType = "text/plain";
        byte[] content = "Hello, World!".getBytes();
        
        MultipartFile file = new MockMultipartFile(fileName, fileName, contentType, content);
        String projectId = "project123";
        Integer userId = 1;
        
        doThrow(new IOException("Test exception")).when(minioClient).putObject(any());
        
        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> 
            minioService.uploadFile(file, projectId, userId)
        );
        assertTrue(exception.getMessage().contains("Error uploading file"));
    }
} 