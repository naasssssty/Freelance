package dit.hua.gr.backend;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@Disabled("Disabled due to multiple @SpringBootConfiguration classes")
@SpringBootTest(classes = BackendApplication.class)
class TestFreelancerProjectApplicationTests {

    @Test
    void contextLoads() {
    }

}
