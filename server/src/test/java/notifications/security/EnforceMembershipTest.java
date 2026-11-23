package notifications.security;

import notifications.AbstractTest;
import notifications.AccessCookieFilter;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Feature toggle notifications.allow-any-user=false: only members of notifications.required-member-of may log in */
@TestPropertySource(properties = "notifications.allow-any-user=false")
class EnforceMembershipTest extends AbstractTest {

    @Test
    void memberCanLogin() throws Exception {
        AccessCookieFilter filter = openIDConnectFlow("/api/notifications", "admin", s -> {
        }, m -> m);

        assertTrue(filter.apiURL().endsWith("/"), filter.apiURL());
        given().filter(filter.cookieFilter()).get("/api/notifications").then().statusCode(200);
    }

    @Test
    void nonMemberIsRejected() throws Exception {
        AccessCookieFilter filter = openIDConnectFlow("/api/notifications", "admin", s -> {
        }, m -> {
            m.put("edumember_is_member_of", List.of("other"));
            return m;
        });

        assertTrue(filter.apiURL().endsWith("/not-allowed"), filter.apiURL());
        given().filter(filter.cookieFilter()).get("/api/notifications").then().statusCode(401);
    }
}
