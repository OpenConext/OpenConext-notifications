package notifications.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "start_at", nullable = false)
    private Instant startAt;

    @Column(name = "ends_at", nullable = false)
    private Instant endsAt;

    @Column(name = "creator", nullable = false)
    private String creator;

    /** The markdown source of the notification */
    @Column(name = "html_text", nullable = false, length = 10000)
    private String htmlText;

    @Column(name = "target_app", nullable = false)
    private String targetApp;
}
