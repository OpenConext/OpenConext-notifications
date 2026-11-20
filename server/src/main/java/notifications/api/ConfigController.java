package notifications.api;

import notifications.config.NotificationsProperties;
import notifications.security.UserNames;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
public class ConfigController {

    public record Config(List<String> targetApps, boolean authenticated, Map<String, Object> user) {
    }

    private final NotificationsProperties properties;

    /** The profile claims of the user that the GUI may see; not the technical claims of the ID token */
    private static final List<String> PROFILE_CLAIMS = List.of(
            "sub", "name", "given_name", "family_name", "email", "preferred_username", "locale");

    /** The profile of the OIDC user, or just the name and email otherwise */
    private static Map<String, Object> user(Authentication authentication) {
        if (authentication.getPrincipal() instanceof OidcUser oidcUser) {
            Map<String, Object> claims = oidcUser.getClaims();
            Map<String, Object> profile = new LinkedHashMap<>();
            PROFILE_CLAIMS.stream()
                    .filter(claim -> claims.get(claim) != null)
                    .forEach(claim -> profile.put(claim, claims.get(claim)));
            return profile;
        }
        return Map.of("sub", authentication.getName(), "email", UserNames.creator(authentication));
    }

    public ConfigController(NotificationsProperties properties) {
        this.properties = properties;
    }

    /** Public: the GUI uses the authenticated flag to decide whether to start the OIDC login */
    @GetMapping("/config")
    public Config config(Authentication authentication) {
        boolean authenticated = authentication != null && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);
        return new Config(properties.targetAppNames(), authenticated,
                authenticated ? user(authentication) : null);
    }
}
