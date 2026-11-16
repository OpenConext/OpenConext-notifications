package notifications.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record NotificationRequest(
        @NotNull Instant startAt,
        @NotNull Instant endsAt,
        @NotBlank @Size(max = 10000) String htmlText,
        @NotBlank String targetApp) {
}
