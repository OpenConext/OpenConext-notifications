package notifications.api;

import jakarta.validation.Valid;
import notifications.config.NotificationsProperties;
import notifications.model.Notification;
import notifications.repository.NotificationRepository;
import notifications.security.UserNames;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

/** CRUD for the GUI, secured with the OIDC session login. Bearer tokens are not supported */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository repository;
    private final NotificationsProperties properties;

    public NotificationController(NotificationRepository repository, NotificationsProperties properties) {
        this.repository = repository;
        this.properties = properties;
    }

    @GetMapping
    public List<NotificationResponse> all() {
        return repository.findAllByOrderByStartAtDesc().stream().map(NotificationResponse::of).toList();
    }

    @GetMapping("/{id}")
    public NotificationResponse one(@PathVariable Long id) {
        return NotificationResponse.of(find(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NotificationResponse create(@Valid @RequestBody NotificationRequest request, Authentication authentication) {
        validate(request);
        Notification notification = new Notification();
        notification.setCreatedAt(Instant.now());
        notification.setCreator(UserNames.creator(authentication));
        apply(notification, request);
        return NotificationResponse.of(repository.save(notification));
    }

    @PutMapping("/{id}")
    public NotificationResponse update(@PathVariable Long id, @Valid @RequestBody NotificationRequest request) {
        validate(request);
        Notification notification = find(id);
        apply(notification, request);
        return NotificationResponse.of(repository.save(notification));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.delete(find(id));
        return ResponseEntity.noContent().build();
    }

    private Notification find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
    }

    private void apply(Notification notification, NotificationRequest request) {
        notification.setStartAt(request.startAt());
        notification.setEndsAt(request.endsAt());
        notification.setHtmlText(request.htmlText());
        notification.setTargetApp(request.targetApp());
    }

    private void validate(NotificationRequest request) {
        if (!request.endsAt().isAfter(request.startAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endsAt must be after startAt");
        }
        if (!properties.isTargetApp(request.targetApp())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown targetApp");
        }
    }
}
