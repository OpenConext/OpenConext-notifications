package notifications.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CustomOidcUserServiceTest {

    private static final String REQUIRED = "urn:mace:surf.nl:invite.test2.surfconext.nl:abc:surfconext_tpm_core";

    private OidcUser user(Map<String, Object> extraClaims) {
        var claims = new java.util.HashMap<String, Object>(extraClaims);
        claims.put("sub", "user");
        var token = new OidcIdToken("token", Instant.now(), Instant.now().plusSeconds(60), claims);
        return new DefaultOidcUser(List.of(), token);
    }

    private CustomOidcUserService service(OidcUser user, String required) {
        return new CustomOidcUserService(request -> user, required);
    }

    @Test
    void memberIsAllowed() {
        OidcUser user = user(Map.of("edumember_is_member_of", List.of("other", REQUIRED)));
        assertSame(user, service(user, REQUIRED).loadUser(null));
    }

    @Test
    void nonMemberIsRejected() {
        OidcUser user = user(Map.of("edumember_is_member_of", List.of("other")));
        var e = assertThrows(OAuth2AuthenticationException.class, () -> service(user, REQUIRED).loadUser(null));
        assertEquals(CustomOidcUserService.NOT_A_MEMBER, e.getError().getErrorCode());
    }

    @Test
    void missingClaimIsRejected() {
        assertThrows(OAuth2AuthenticationException.class, () -> service(user(Map.of()), REQUIRED).loadUser(null));
    }

    @Test
    void blankRequirementAllowsEveryone() {
        OidcUser user = user(Map.of());
        assertSame(user, service(user, "").loadUser(null));
    }
}
