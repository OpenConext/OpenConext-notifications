package notifications.security;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * Only users that are a member of the required group (claim edumember_is_member_of) may log in.
 * Others are rejected with an {@link OAuth2AuthenticationException} with error code {@link #NOT_A_MEMBER}.
 */
public class CustomOidcUserService implements OAuth2UserService<OidcUserRequest, OidcUser> {

    public static final String NOT_A_MEMBER = "not_a_member";
    public static final String MEMBER_OF_CLAIM = "edumember_is_member_of";

    private static final Log LOG = LogFactory.getLog(CustomOidcUserService.class);

    private final OAuth2UserService<OidcUserRequest, OidcUser> delegate;
    private final String requiredMemberOf;

    public CustomOidcUserService(String requiredMemberOf) {
        this(new OidcUserService(), requiredMemberOf);
    }

    CustomOidcUserService(OAuth2UserService<OidcUserRequest, OidcUser> delegate, String requiredMemberOf) {
        this.delegate = delegate;
        this.requiredMemberOf = requiredMemberOf;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = delegate.loadUser(userRequest);
        // not configured: no restriction
        if (requiredMemberOf == null || requiredMemberOf.isBlank()) {
            return oidcUser;
        }
        Map<String, Object> claims = oidcUser.getClaims();
        if (!isMember(claims.get(MEMBER_OF_CLAIM))) {
            LOG.warn("User %s is not a member of %s".formatted(oidcUser.getSubject(), requiredMemberOf));
            throw new OAuth2AuthenticationException(new OAuth2Error(NOT_A_MEMBER,
                    "Not a member of " + requiredMemberOf, null));
        }
        return oidcUser;
    }

    private boolean isMember(Object claim) {
        Collection<?> values = claim instanceof Collection<?> c ? c : claim == null ? List.of() : List.of(claim);
        return values.stream().anyMatch(value -> requiredMemberOf.equals(String.valueOf(value)));
    }
}
