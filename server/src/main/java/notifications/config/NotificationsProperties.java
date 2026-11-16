package notifications.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

/**
 * The applications for which notifications can be created. Each target app is also a
 * basic-authentication user (username = name) of the server-to-server API.
 */
@ConfigurationProperties(prefix = "notifications")
@Getter
@Setter
public class NotificationsProperties {

    private List<TargetApp> targetApps = new ArrayList<>();

    @Getter
    @Setter
    public static class TargetApp {
        private String name;
        private String password;
    }

    public List<String> targetAppNames() {
        return targetApps.stream().map(TargetApp::getName).toList();
    }

    public boolean isTargetApp(String name) {
        return targetApps.stream().anyMatch(app -> app.getName().equals(name));
    }
}
