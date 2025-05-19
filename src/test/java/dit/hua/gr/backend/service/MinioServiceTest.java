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
        
        doNothing().when(minioClient).putObject(any(PutObjectArgs.class));

        // Act & Assert
        assertDoesNotThrow(() -> minioService.uploadFile(file, projectId, userId));
        verify(minioClient, times(1)).putObject(any(PutObjectArgs.class));
    }

    @Test
    void testGetFile() throws Exception {
        // Arrange
        String fileName = "test-file.txt";
        GetObjectResponse mockResponse = mock(GetObjectResponse.class);
        
        when(minioClient.getObject(any(GetObjectArgs.class))).thenReturn(mockResponse);

        // Act
        InputStream result = minioService.getFile(fileName);

        // Assert
        assertNotNull(result);
        verify(minioClient, times(1)).getObject(any(GetObjectArgs.class));
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
        
        doThrow(new MinioException("Test exception")).when(minioClient).putObject(any(PutObjectArgs.class));

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> 
            minioService.uploadFile(file, projectId, userId)
        );
        assertTrue(exception.getMessage().contains("Error uploading file"));
    }
} 