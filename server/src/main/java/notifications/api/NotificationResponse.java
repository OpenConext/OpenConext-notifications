package notifications.api;

import notifications.model.Notification;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        Instant createdAt,
        Instant startAt,
        Instant endsAt,
        String creator,
        String htmlText,
        String targetApp) {

    public static NotificationResponse of(Notification n) {
        return new NotificationResponse(n.getId(), n.getCreatedAt(), n.getStartAt(), n.getEndsAt(),
                n.getCreator(), n.getHtmlText(), n.getTargetApp());
    }
}
