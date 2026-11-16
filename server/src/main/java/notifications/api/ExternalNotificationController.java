package notifications.api;

import notifications.markdown.MarkdownRenderer;
import notifications.model.Notification;
import notifications.repository.NotificationRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

/**
 * Server-to-server API, secured with basic authentication. The username of the authenticated
 * application is the target app, so an application can only retrieve its own notifications.
 */
@RestController
@RequestMapping("/api/external")
public class ExternalNotificationController {

    public enum Format {html, markdown}

    public record ExternalNotification(Long id, Instant startAt, Instant endsAt, String creator, String text,
                                       Format format) {
    }

    private final NotificationRepository repository;
    private final MarkdownRenderer markdownRenderer;

    public ExternalNotificationController(NotificationRepository repository, MarkdownRenderer markdownRenderer) {
        this.repository = repository;
        this.markdownRenderer = markdownRenderer;
    }

    /** The currently active notifications of the authenticated target app */
    @GetMapping("/notifications")
    public List<ExternalNotification> notifications(Authentication authentication,
                                                    @RequestParam(defaultValue = "html") Format format) {
        Instant now = Instant.now();
        List<Notification> active = repository
                .findByTargetAppAndStartAtLessThanEqualAndEndsAtGreaterThanOrderByStartAtDesc(
                        authentication.getName(), now, now);
        return active.stream()
                .map(n -> new ExternalNotification(n.getId(), n.getStartAt(), n.getEndsAt(), n.getCreator(),
                        format == Format.html ? markdownRenderer.toHtml(n.getHtmlText()) : n.getHtmlText(), format))
                .toList();
    }
}
