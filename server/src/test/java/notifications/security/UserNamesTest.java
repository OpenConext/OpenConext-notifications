package notifications.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class UserNamesTest {

    private Authentication oidc(Map<String, Object> extraClaims) {
        Map<String, Object> claims = new HashMap<>(extraClaims);
        claims.put("sub", "subject");
        OidcIdToken idToken = new OidcIdToken("token", Instant.now(), Instant.now().plusSeconds(60), claims);
        DefaultOidcUser user = new DefaultOidcUser(List.of(), idToken);
        return new OAuth2AuthenticationToken(user, List.of(), "oidcng");
    }

    @Test
    void emailFirst() {
        assertEquals("a@b.nl", UserNames.creator(oidc(Map.of("email", "a@b.nl", "name", "John Doe"))));
    }

    @Test
    void fullNameWithoutEmail() {
        assertEquals("John Doe", UserNames.creator(oidc(Map.of("name", "John Doe"))));
    }

    @Test
    void subjectWithoutEmailAndName() {
        assertEquals("subject", UserNames.creator(oidc(Map.of())));
    }

    @Test
    void nonOidcUsesName() {
        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated("jane", "N/A", List.of());
        assertEquals("jane", UserNames.creator(authentication));
    }
}
