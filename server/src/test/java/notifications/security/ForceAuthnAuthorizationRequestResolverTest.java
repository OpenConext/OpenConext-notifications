package notifications.security;

import io.restassured.RestAssured;
import notifications.AbstractTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ForceAuthnAuthorizationRequestResolverTest extends AbstractTest {

    @Autowired
    private ClientRegistrationRepository clientRegistrationRepository;

    private String authorizationLocation(String query) {
        return given()
                .redirects().follow(false)
                .get("/oauth2/authorization/oidcng" + query)
                .then().statusCode(302).extract()
                .header("Location");
    }

    @Test
    void forceAddsPromptLogin() {
        assertTrue(authorizationLocation("?force=true").contains("prompt=login"));
    }

    @Test
    void noPromptByDefault() {
        assertFalse(authorizationLocation("").contains("prompt="));
        assertFalse(authorizationLocation("?force=false").contains("prompt="));
    }

    @Test
    void resolveWithRegistrationId() {
        ForceAuthnAuthorizationRequestResolver resolver =
                new ForceAuthnAuthorizationRequestResolver(clientRegistrationRepository);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/oauth2/authorization/oidcng");
        request.setServerPort(RestAssured.port);

        assertFalse(resolver.resolve(request, "oidcng").getAdditionalParameters().containsKey("prompt"));

        request.setParameter("force", "true");
        OAuth2AuthorizationRequest forced = resolver.resolve(request, "oidcng");
        assertEquals("login", forced.getAdditionalParameters().get("prompt"));
    }
}
