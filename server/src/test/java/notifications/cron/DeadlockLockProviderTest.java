package notifications.cron;

import net.javacrumbs.shedlock.core.LockConfiguration;
import net.javacrumbs.shedlock.core.LockProvider;
import net.javacrumbs.shedlock.core.SimpleLock;
import org.junit.jupiter.api.Test;

import java.sql.SQLException;
import java.sql.SQLTransactionRollbackException;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DeadlockLockProviderTest {

    private final LockConfiguration configuration =
            new LockConfiguration(Instant.now(), "test", Duration.ofMinutes(1), Duration.ZERO);

    private Optional<SimpleLock> lockThrowing(RuntimeException exception) {
        LockProvider failing = lockConfiguration -> {
            throw exception;
        };
        return new DeadlockLockProvider(failing).lock(configuration);
    }

    @Test
    void delegates() {
        SimpleLock lock = () -> {
        };
        assertEquals(Optional.of(lock), new DeadlockLockProvider(c -> Optional.of(lock)).lock(configuration));
    }

    @Test
    void deadlockByExceptionType() {
        assertTrue(lockThrowing(new RuntimeException(new SQLTransactionRollbackException("deadlock"))).isEmpty());
    }

    @Test
    void deadlockByErrorCode() {
        assertTrue(lockThrowing(new RuntimeException("wrapped", new SQLException("deadlock", "40001", 1213))).isEmpty());
    }

    @Test
    void otherSqlError() {
        assertTrue(lockThrowing(new RuntimeException(new SQLException("other", "42000", 1142))).isEmpty());
    }

    @Test
    void unexpectedError() {
        assertTrue(lockThrowing(new IllegalStateException("boom")).isEmpty());
    }
}
