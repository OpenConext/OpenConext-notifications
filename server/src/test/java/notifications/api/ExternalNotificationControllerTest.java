package notifications.api;

import io.restassured.common.mapper.TypeRef;
import io.restassured.http.ContentType;
import notifications.AbstractTest;
import notifications.config.NotificationsProperties;
import notifications.config.NotificationsProperties.TargetApp;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class ExternalNotificationControllerTest extends AbstractTest {

    private static final String PATH = "/api/external/notifications";

    /** The credentials of the target apps are the ones configured in application.yml */
    @Autowired
    private NotificationsProperties properties;

    @Test
    void html() {
        List<Map<String, Object>> notifications = notifications("myconext", null);

        // the expired notification and the one of the other app are not returned
        assertEquals(1, notifications.size());
        Map<String, Object> notification = notifications.get(0);
        // the markdown is rendered and sanitized
        assertEquals("<p>Hello <strong>bold</strong> &lt;script&gt;alert(1)&lt;/script&gt;</p>\n",
                notification.get("text"));
        assertEquals("html", notification.get("format"));
        assertEquals("test", notification.get("creator"));
    }

    @Test
    void markdown() {
        List<Map<String, Object>> notifications = notifications("myconext", "markdown");

        assertEquals(1, notifications.size());
        assertEquals("Hello **bold** <script>alert(1)</script>", notifications.get(0).get("text"));
        assertEquals("markdown", notifications.get(0).get("format"));
    }

    @Test
    void onlyOwnNotifications() {
        List<Map<String, Object>> notifications = notifications("servicedesk", null);

        assertEquals(1, notifications.size());
        assertEquals("<p>other app</p>\n", notifications.get(0).get("text"));
    }

    @Test
    void allConfiguredTargetAppsCanAuthenticate() {
        assertFalse(properties.getTargetApps().isEmpty());
        properties.getTargetApps().forEach(app -> given()
                .auth().preemptive().basic(app.getName(), app.getPassword())
                .accept(ContentType.JSON)
                .get(PATH)
                .then().statusCode(200));
    }

    @Test
    void wrongPassword() {
        given()
                .auth().preemptive().basic("myconext", "wrong")
                .accept(ContentType.JSON)
                .get(PATH)
                .then().statusCode(401);
    }

    @Test
    void unknownUser() {
        given()
                .auth().preemptive().basic("unknown", password("myconext"))
                .accept(ContentType.JSON)
                .get(PATH)
                .then().statusCode(401);
    }

    @Test
    void noCredentials() {
        given().accept(ContentType.JSON).get(PATH).then().statusCode(401);
    }

    @Test
    void invalidFormat() {
        given()
                .auth().preemptive().basic("myconext", password("myconext"))
                .queryParam("format", "pdf")
                .accept(ContentType.JSON)
                .get(PATH)
                .then().statusCode(400);
    }

    private List<Map<String, Object>> notifications(String app, String format) {
        var request = given()
                .auth().preemptive().basic(app, password(app))
                .accept(ContentType.JSON);
        if (format != null) {
            request = request.queryParam("format", format);
        }
        return request
                .get(PATH)
                .then().statusCode(200).extract()
                .as(new TypeRef<>() {
                });
    }

    private String password(String app) {
        return properties.getTargetApps().stream()
                .filter(targetApp -> targetApp.getName().equals(app))
                .map(TargetApp::getPassword)
                .findFirst().orElseThrow();
    }
}
