package notifications.security;

import io.restassured.common.mapper.TypeRef;
import io.restassured.http.ContentType;
import notifications.AbstractTest;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * The local profile adds the fake login filter. The test profile is kept (not inherited, but listed) for the
 * no-op ShedLock provider that is bound to it.
 */
@ActiveProfiles(profiles = {"test", "local"}, inheritProfiles = false)
class LocalDevelopmentAuthenticationFilterTest extends AbstractTest {

    @Override
    protected boolean seedDatabase() {
        return false;
    }

    @Test
    void fakeLogin() {
        // no login flow: the filter authenticates every request
        Map<String, Object> config = given()
                .accept(ContentType.JSON)
                .get("/config")
                .then().statusCode(200).extract()
                .as(new TypeRef<>() {
                });

        assertTrue((Boolean) config.get("authenticated"));
        Map<String, Object> user = (Map<String, Object>) config.get("user");
        assertEquals("local.user@example.com", user.get("sub"));
        assertEquals("local.user@example.com", user.get("email"));
    }

    @Test
    void apiIsAccessible() {
        given()
                .accept(ContentType.JSON)
                .get("/api/notifications")
                .then().statusCode(200);
    }
}
