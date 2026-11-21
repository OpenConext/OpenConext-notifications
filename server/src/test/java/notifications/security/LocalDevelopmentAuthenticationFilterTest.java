package notifications.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class LocalDevelopmentAuthenticationFilterTest {

    private final LocalDevelopmentAuthenticationFilter filter = new LocalDevelopmentAuthenticationFilter();

    @AfterEach
    void clear() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void fakeLogin() throws Exception {
        SecurityContextHolder.clearContext();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(), chain);

        assertEquals("local.user@example.com", SecurityContextHolder.getContext().getAuthentication().getName());
        assertNotNull(chain.getRequest());
    }

    @Test
    void keepsExistingAuthentication() throws Exception {
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated("jane", "N/A", List.of()));

        filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(), new MockFilterChain());

        assertEquals("jane", SecurityContextHolder.getContext().getAuthentication().getName());
    }
}
