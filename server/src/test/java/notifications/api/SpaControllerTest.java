package notifications.api;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SpaControllerTest {

    @Test
    void forwardsToIndex() {
        assertEquals("forward:/index.html", new SpaController().spa());
    }
}
