package notifications;

import notifications.model.Notification;
import notifications.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:test;MODE=MariaDB;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=none"})
class NotificationsApplicationTest {

    @Autowired
    MockMvc mockMvc;
    @Autowired
    NotificationRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
        Instant now = Instant.now();
        save("myconext", "Hello **bold** <script>alert(1)</script>", now.minus(1, ChronoUnit.HOURS), now.plus(1, ChronoUnit.HOURS));
        save("myconext", "expired", now.minus(3, ChronoUnit.HOURS), now.minus(2, ChronoUnit.HOURS));
        save("servicedesk", "other app", now.minus(1, ChronoUnit.HOURS), now.plus(1, ChronoUnit.HOURS));
    }

    private void save(String app, String text, Instant start, Instant end) {
        Notification n = new Notification();
        n.setCreatedAt(Instant.now());
        n.setCreator("test");
        n.setTargetApp(app);
        n.setHtmlText(text);
        n.setStartAt(start);
        n.setEndsAt(end);
        repository.save(n);
    }

    @Test
    void externalHtml() throws Exception {
        mockMvc.perform(get("/api/external/notifications").with(httpBasic("myconext", "secret")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].text").value("<p>Hello <strong>bold</strong> &lt;script&gt;alert(1)&lt;/script&gt;</p>\n"));
    }

    @Test
    void externalMarkdown() throws Exception {
        mockMvc.perform(get("/api/external/notifications?format=markdown").with(httpBasic("myconext", "secret")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].text").value("Hello **bold** <script>alert(1)</script>"));
    }

    @Test
    void externalWrongPassword() throws Exception {
        mockMvc.perform(get("/api/external/notifications").with(httpBasic("myconext", "wrong")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void crudRequiresLogin() throws Exception {
        mockMvc.perform(get("/api/notifications")).andExpect(status().isUnauthorized());
    }

    @Test
    void configIsPublic() throws Exception {
        mockMvc.perform(get("/config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(false))
                .andExpect(jsonPath("$.targetApps.length()").value(2));
    }

    @Test
    void create() throws Exception {
        Instant now = Instant.now();
        String body = """
                {"startAt":"%s","endsAt":"%s","htmlText":"# Hi","targetApp":"myconext"}
                """.formatted(now, now.plus(1, ChronoUnit.DAYS));
        mockMvc.perform(post("/api/notifications").with(user("jane")).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.creator").value("jane"));
        mockMvc.perform(post("/api/notifications").with(user("jane")).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(body.replace("myconext", "nope")))
                .andExpect(status().isBadRequest());
    }
}
