package notifications.cron;

import net.javacrumbs.shedlock.core.LockConfiguration;
import net.javacrumbs.shedlock.core.LockProvider;
import notifications.AbstractTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import javax.sql.DataSource;
import java.time.Duration;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ShedLockConfigTest extends AbstractTest {

    @Autowired
    private LockProvider lockProvider;
    @Autowired
    private DataSource dataSource;

    @Test
    void testProfileLockAlwaysSucceeds() {
        var lock = lockProvider.lock(new LockConfiguration(Instant.now(), "test", Duration.ofMinutes(1), Duration.ZERO));

        assertTrue(lock.isPresent());
        lock.get().unlock();
    }

    @Test
    void productionLockProviderIsDeadlockSafe() {
        assertInstanceOf(DeadlockLockProvider.class, new ShedLockConfig().lockProvider(dataSource));
    }
}
