package notifications.api;

import notifications.config.NotificationsProperties;
import notifications.security.UserNames;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ConfigController {

    public record Config(List<String> targetApps, boolean authenticated, String user) {
    }

    private final NotificationsProperties properties;

    public ConfigController(NotificationsProperties properties) {
        this.properties = properties;
    }

    /** Public: the GUI uses the authenticated flag to decide whether to start the OIDC login */
    @GetMapping("/config")
    public Config config(Authentication authentication) {
        boolean authenticated = authentication != null && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);
        return new Config(properties.targetAppNames(), authenticated,
                authenticated ? UserNames.creator(authentication) : null);
    }
}
