package notifications.api;

import io.restassured.common.mapper.TypeRef;
import io.restassured.http.ContentType;
import notifications.AbstractTest;
import io.restassured.response.ValidatableResponse;
import io.restassured.specification.RequestSpecification;
import notifications.AccessCookieFilter;
import notifications.model.Notification;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.*;

class NotificationControllerTest extends AbstractTest {

    @Test
    void all() {
        AccessCookieFilter accessCookieFilter = openIDConnectFlow("/api/notifications", "admin");

        List<Map<String, Object>> notifications = given()
                .when()
                .filter(accessCookieFilter.cookieFilter())
                .accept(ContentType.JSON)
                .contentType(ContentType.JSON)
                .get("/api/notifications")
                .then().statusCode(200).extract()
                .as(new TypeRef<>() {
                });

        assertEquals(3, notifications.size());

    }

    @Test
    void one() {
        AccessCookieFilter accessCookieFilter = openIDConnectFlow("/api/notifications", "admin");
        Notification seeded = notificationRepository.findAll().stream()
                .filter(n -> n.getHtmlText().equals("expired")).findFirst().orElseThrow();

        Map<String, Object> notification = given()
                .when()
                .filter(accessCookieFilter.cookieFilter())
                .accept(ContentType.JSON)
                .contentType(ContentType.JSON)
                .get("/api/notifications/{id}", seeded.getId())
                .then().statusCode(200).extract()
                .as(new TypeRef<>() {
                });

        assertEquals("expired", notification.get("htmlText"));
        assertEquals("myconext", notification.get("targetApp"));
        assertEquals("test", notification.get("creator"));

        given()
                .when()
                .filter(accessCookieFilter.cookieFilter())
                .accept(ContentType.JSON)
                .get("/api/notifications/{id}", Long.MAX_VALUE)
                .then().statusCode(404);
    }

    @Test
    void unauthenticated() {
        given().accept(ContentType.JSON).get("/api/notifications").then().statusCode(401);
    }

    @Test
    void bearerTokensAreNotSupported() {
        given()
                .header("Authorization", "Bearer some-access-token")
                .accept(ContentType.JSON)
                .get("/api/notifications")
                .then().statusCode(401);
    }

    @Test
    void create() {
        AccessCookieFilter accessCookieFilter = openIDConnectFlow("/api/notifications", "admin");
        Instant start = Instant.now().plus(1, ChronoUnit.HOURS);

        Map<String, Object> created = write(accessCookieFilter, "POST", "/api/notifications",
                body(start, start.plus(1, ChronoUnit.HOURS), "new text", "myconext"))
                .statusCode(201).extract()
                .as(new TypeRef<>() {
                });

        assertEquals("new text", created.get("htmlText"));
        assertEquals("myconext", created.get("targetApp"));
        assertNotNull(created.get("id"));
        assertEquals(4, notificationRepository.count());

        // endsAt not after startAt
        write(accessCookieFilter, "POST", "/api/notifications", body(start, start, "text", "myconext"))
                .statusCode(400);
        // unknown target app
        write(accessCookieFilter, "POST", "/api/notifications",
                body(start, start.plus(1, ChronoUnit.HOURS), "text", "unknown"))
                .statusCode(400);
        // blank text
        write(accessCookieFilter, "POST", "/api/notifications",
                body(start, start.plus(1, ChronoUnit.HOURS), " ", "myconext"))
                .statusCode(400);
        assertEquals(4, notificationRepository.count());
    }

    @Test
    void update() {
        AccessCookieFilter accessCookieFilter = openIDConnectFlow("/api/notifications", "admin");
        Notification seeded = notificationRepository.findAll().stream()
                .filter(n -> n.getHtmlText().equals("other app")).findFirst().orElseThrow();
        Instant start = Instant.now().plus(2, ChronoUnit.HOURS);

        Map<String, Object> updated = write(accessCookieFilter, "PUT", "/api/notifications/" + seeded.getId(),
                body(start, start.plus(1, ChronoUnit.HOURS), "changed", "myconext"))
                .statusCode(200).extract()
                .as(new TypeRef<>() {
                });

        assertEquals("changed", updated.get("htmlText"));
        assertEquals("myconext", updated.get("targetApp"));
        // the creator is not changed by an update
        assertEquals("test", updated.get("creator"));
        assertEquals("changed", notificationRepository.findById(seeded.getId()).orElseThrow().getHtmlText());

        write(accessCookieFilter, "PUT", "/api/notifications/" + Long.MAX_VALUE,
                body(start, start.plus(1, ChronoUnit.HOURS), "changed", "myconext"))
                .statusCode(404);
        write(accessCookieFilter, "PUT", "/api/notifications/" + seeded.getId(),
                body(start, start.minus(1, ChronoUnit.HOURS), "changed", "myconext"))
                .statusCode(400);
    }

    @Test
    void delete() {
        AccessCookieFilter accessCookieFilter = openIDConnectFlow("/api/notifications", "admin");
        Notification seeded = notificationRepository.findAll().get(0);

        write(accessCookieFilter, "DELETE", "/api/notifications/" + seeded.getId(), null).statusCode(204);

        assertEquals(2, notificationRepository.count());
        assertTrue(notificationRepository.findById(seeded.getId()).isEmpty());
        write(accessCookieFilter, "DELETE", "/api/notifications/" + seeded.getId(), null).statusCode(404);
    }

    @Test
    void writeWithoutCsrfToken() {
        AccessCookieFilter accessCookieFilter = openIDConnectFlow("/api/notifications", "admin");
        Instant start = Instant.now().plus(1, ChronoUnit.HOURS);

        given()
                .when()
                .filter(accessCookieFilter.cookieFilter())
                .accept(ContentType.JSON)
                .contentType(ContentType.JSON)
                .body(body(start, start.plus(1, ChronoUnit.HOURS), "text", "myconext"))
                .post("/api/notifications")
                .then().statusCode(403);
        assertEquals(3, notificationRepository.count());
    }

    private static Map<String, Object> body(Instant startAt, Instant endsAt, String htmlText, String targetApp) {
        return Map.of("startAt", startAt.toString(), "endsAt", endsAt.toString(),
                "htmlText", htmlText, "targetApp", targetApp);
    }

    /** A state changing request, with the session cookie and the CSRF token from the login flow */
    private static ValidatableResponse write(AccessCookieFilter accessCookieFilter, String method, String path,
                                             Object body) {
        RequestSpecification spec = given()
                .when()
                .filter(accessCookieFilter.cookieFilter())
                .accept(ContentType.JSON)
                .contentType(ContentType.JSON)
                .header(accessCookieFilter.csrfToken().getHeaderName(), accessCookieFilter.csrfToken().getToken());
        if (body != null) {
            spec = spec.body(body);
        }
        return spec.request(method, path).then();
    }
}
