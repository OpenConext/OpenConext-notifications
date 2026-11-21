package notifications;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.SpringApplicationRunListener;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.concurrent.atomic.AtomicReference;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Starts the application through its main method, on its own port and an in-memory database
 */
class NotificationsApplicationTest {

    private static final int PORT = 8099;

    @Test
    void main() {
        AtomicReference<ConfigurableApplicationContext> context = new AtomicReference<>();
        // main() does not return the context, a hook lets us close it afterwards
        SpringApplication.withHook(application -> new SpringApplicationRunListener() {
            @Override
            public void started(ConfigurableApplicationContext applicationContext, java.time.Duration timeTaken) {
                context.set(applicationContext);
            }
        }, () -> NotificationsApplication.main(new String[]{
                "--server.port=" + PORT
        }));
        try {
            assertNotNull(context.get());
            // The load balancer calls the health endpoint without credentials
            given().port(PORT).get("/internal/health").then().statusCode(200).body("status", equalTo("UP"));
            given().port(PORT).get("/internal/info").then().statusCode(200);
            // while the API is secured
            given().port(PORT).get("/api/notifications").then().statusCode(401);
            assertEquals(String.valueOf(PORT), context.get().getEnvironment().getProperty("local.server.port"));
        } finally {
            if (context.get() != null) {
                context.get().close();
            }
        }
    }
}
