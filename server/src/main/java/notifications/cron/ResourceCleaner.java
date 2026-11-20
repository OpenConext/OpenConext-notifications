package notifications.cron;

import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import notifications.repository.NotificationRepository;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

/**
 * Removes the notifications that ended more than {@code cron.notification-delete-after-days} days ago.
 * The lock (ShedLock) makes sure that only one node runs the cleaner at a time.
 */
@Component
public class ResourceCleaner {

    public static final String LOCK_NAME = "resource_cleaner_user_level_lock";
    private static final Log LOG = LogFactory.getLog(ResourceCleaner.class);

    private final NotificationRepository notificationRepository;

    @Value("${cron.notification-delete-after-days:5}")
    private int notificationDeleteAfterDays;

    public ResourceCleaner(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Scheduled(fixedDelayString = "${cron.cleaner-cron}", initialDelayString = "${cron.cleaner-cron-initial-delay}")
    @SchedulerLock(name = LOCK_NAME, lockAtLeastFor = "${cron.cleaner-lock-at-least-for}",
            lockAtMostFor = "${cron.cleaner-lock-at-most-for}")
    @Transactional
    public void clean() {
        LOG.info("CRON: Cleaning resources");
        Map<String, Object> results = this.doClean();
        LOG.info("CRON: Cleaning results: " + results);
    }

    @Transactional
    public Map<String, Object> doClean() {
        Instant threshold = Instant.now().minus(notificationDeleteAfterDays, ChronoUnit.DAYS);
        long removed = notificationRepository.deleteByEndsAtBefore(threshold);
        return Map.of("notificationsDeleted", removed, "endedBefore", threshold.toString());
    }
}
