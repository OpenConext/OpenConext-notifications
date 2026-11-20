package notifications.cron;

import notifications.model.Notification;
import notifications.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:cleaner;MODE=MariaDB;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=none"})
class ResourceCleanerTest {

    @Autowired
    NotificationRepository repository;
    @Autowired
    ResourceCleaner resourceCleaner;

    private void save(String text, Instant end) {
        Notification n = new Notification();
        n.setCreatedAt(Instant.now());
        n.setCreator("test");
        n.setTargetApp("myconext");
        n.setHtmlText(text);
        n.setStartAt(end.minus(1, ChronoUnit.DAYS));
        n.setEndsAt(end);
        repository.save(n);
    }

    @Test
    void removesNotificationsEndedMoreThanFiveDaysAgo() {
        repository.deleteAll();
        Instant now = Instant.now();
        save("old", now.minus(6, ChronoUnit.DAYS));
        save("recently ended", now.minus(4, ChronoUnit.DAYS));
        save("active", now.plus(1, ChronoUnit.DAYS));

        Map<String, Object> results = resourceCleaner.doClean();

        assertEquals(1L, results.get("notificationsDeleted"));
        List<String> remaining = repository.findAll().stream().map(Notification::getHtmlText).sorted().toList();
        assertEquals(List.of("active", "recently ended"), remaining);
    }
}
