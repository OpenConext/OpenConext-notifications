package notifications.security;

import notifications.AbstractTest;
import notifications.AccessCookieFilter;
import org.junit.jupiter.api.Test;

import java.util.List;

import static io.restassured.RestAssured.given;

/** Default (notifications.allow-any-user not set): users that are not a member can log in too */
class AllowAnyUserTest extends AbstractTest {

    @Test
    void nonMemberCanLogin() throws Exception {
        AccessCookieFilter filter = openIDConnectFlow("/api/notifications", "admin", s -> {
        }, m -> {
            m.put("edumember_is_member_of", List.of("other"));
            return m;
        });

        given().filter(filter.cookieFilter()).get("/api/notifications").then().statusCode(200);
    }
}
