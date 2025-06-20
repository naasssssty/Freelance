<<<<<<< HEAD
package dit.hua.gr.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

@SpringBootTest(classes = BackendApplication.class)
@ComponentScan(excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = TestFreelancerProjectApplication.class))
class TestFreelancerProjectApplicationTests {

    @Test
    void contextLoads() {
    }

}
=======
package dit.hua.gr.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(classes = BackendApplication.class)
@ActiveProfiles("test")
class TestFreelancerProjectApplicationTests {

    @Test
    void contextLoads() {
    }

}
>>>>>>> test-branch
