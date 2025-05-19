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
        
        when(minioClient.putObject(any(PutObjectArgs.class))).thenThrow(new IOException("Test exception"));
        
        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> 
            minioService.uploadFile(file, projectId, userId)
        );
        assertTrue(exception.getMessage().contains("Error uploading file"));
    }
} 