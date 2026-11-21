package notifications.cron;

import net.javacrumbs.shedlock.core.LockConfiguration;
import net.javacrumbs.shedlock.core.LockProvider;
import net.javacrumbs.shedlock.core.SimpleLock;
import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

import java.sql.SQLException;
import java.sql.SQLTransactionRollbackException;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DeadlockLockProviderTest {

    private final Logger logger = (Logger) LoggerFactory.getLogger(DeadlockLockProvider.class);
    private final ListAppender<ILoggingEvent> appender = new ListAppender<>();

    /** Capture the log events instead of printing them (and the stacktrace) to the build output */
    @BeforeEach
    void captureLogging() {
        appender.start();
        logger.addAppender(appender);
        logger.setAdditive(false);
    }

    @AfterEach
    void restoreLogging() {
        logger.detachAppender(appender);
        logger.setAdditive(true);
        appender.stop();
    }

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
        assertEquals(Level.WARN, appender.list.get(0).getLevel());
    }

    @Test
    void deadlockByErrorCode() {
        assertTrue(lockThrowing(new RuntimeException("wrapped", new SQLException("deadlock", "40001", 1213))).isEmpty());
        assertEquals(Level.WARN, appender.list.get(0).getLevel());
    }

    @Test
    void otherSqlError() {
        assertTrue(lockThrowing(new RuntimeException(new SQLException("other", "42000", 1142))).isEmpty());
        assertEquals(Level.ERROR, appender.list.get(0).getLevel());
    }

    @Test
    void unexpectedError() {
        assertTrue(lockThrowing(new IllegalStateException("boom")).isEmpty());
        assertEquals(1, appender.list.size());
        assertEquals(Level.ERROR, appender.list.get(0).getLevel());
        assertEquals("boom", appender.list.get(0).getThrowableProxy().getMessage());
    }
}
