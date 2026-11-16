package notifications.repository;

import notifications.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findAllByOrderByStartAtDesc();

    List<Notification> findByTargetAppAndStartAtLessThanEqualAndEndsAtGreaterThanOrderByStartAtDesc(
            String targetApp, Instant startAt, Instant endsAt);

}
