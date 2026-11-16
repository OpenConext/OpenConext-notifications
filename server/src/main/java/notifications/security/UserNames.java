package notifications.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

public final class UserNames {

    private UserNames() {
    }

    /** A human readable name for the authenticated user, used as creator of notifications */
    public static String creator(Authentication authentication) {
        if (authentication.getPrincipal() instanceof OidcUser user) {
            if (user.getEmail() != null) {
                return user.getEmail();
            }
            if (user.getFullName() != null) {
                return user.getFullName();
            }
            return user.getSubject();
        }
        return authentication.getName();
    }
}
