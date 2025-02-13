package dit.hua.gr.backend.repository;

import dit.hua.gr.backend.model.Report;
import dit.hua.gr.backend.model.ReportStatus;
import dit.hua.gr.backend.model.Project;
import dit.hua.gr.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Integer> {
    List<Report> findByStatus(ReportStatus status);
    List<Report> findByProject(Project project);
    List<Report> findByReporter(User reporter);
} 