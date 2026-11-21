package notifications.api;

import io.restassured.common.mapper.TypeRef;
import io.restassured.http.ContentType;
import notifications.AbstractTest;
import notifications.AccessCookieFilter;
import notifications.config.NotificationsProperties;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SuppressWarnings("unchecked")
class ConfigControllerTest extends AbstractTest {

    @Autowired
    private NotificationsProperties properties;

    @Test
    void unauthenticated() {
        // public: the GUI uses the authenticated flag to decide whether to start the OIDC login
        Map<String, Object> config = given()
                .accept(ContentType.JSON)
                .get("/config")
                .then().statusCode(200).extract()
                .as(new TypeRef<>() {
                });

        assertTrue(((List<String>)config.get("targetApps")).containsAll(List.of("myconext", "servicedesk")));
        assertFalse((Boolean) config.get("authenticated"));
        assertNull(config.get("user"));
    }

    @Test
    void authenticated() {
        AccessCookieFilter accessCookieFilter = openIDConnectFlow("/api/notifications", "admin");

        Map<String, Object> config = given()
                .when()
                .filter(accessCookieFilter.cookieFilter())
                .accept(ContentType.JSON)
                .get("/config")
                .then().statusCode(200).extract()
                .as(new TypeRef<>() {
                });

        assertTrue(((List<String>)config.get("targetApps")).containsAll(List.of("myconext", "servicedesk")));
        assertTrue((Boolean) config.get("authenticated"));
        Map<String, Object> user = (Map<String, Object>) config.get("user");
        assertEquals("admin", user.get("sub"));
        assertEquals("Mary", user.get("given_name"));
        assertEquals("Doe", user.get("family_name"));
        // only the profile claims, not the technical claims of the ID token
        assertFalse(user.containsKey("nonce"));
        assertFalse(user.containsKey("iss"));
    }

    @Test
    void nonOidcUser() {
        // e.g. the fake login of the local profile
        ConfigController controller = new ConfigController(properties);
        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated("jane", "N/A", List.of());

        ConfigController.Config config = controller.config(authentication);

        assertTrue(config.authenticated());
        assertEquals(Map.of("sub", "jane", "email", "jane"), config.user());
    }

    @Test
    void anonymous() {
        ConfigController controller = new ConfigController(properties);
        Authentication anonymous = new AnonymousAuthenticationToken("key", "anonymous",
                List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS")));

        assertFalse(controller.config(anonymous).authenticated());
        assertFalse(controller.config(null).authenticated());
    }
}
