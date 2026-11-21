package notifications.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;

import static org.junit.jupiter.api.Assertions.assertEquals;

class NotAllowedAuthenticationFailureHandlerTest {

    private final NotAllowedAuthenticationFailureHandler handler = new NotAllowedAuthenticationFailureHandler();

    private String redirect(org.springframework.security.core.AuthenticationException exception) throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        handler.onAuthenticationFailure(new MockHttpServletRequest(), response, exception);
        return response.getRedirectedUrl();
    }

    @Test
    void notAMember() throws Exception {
        var exception = new OAuth2AuthenticationException(new OAuth2Error(CustomOidcUserService.NOT_A_MEMBER));
        assertEquals("/not-allowed", redirect(exception));
    }

    @Test
    void otherOAuthError() throws Exception {
        var exception = new OAuth2AuthenticationException(new OAuth2Error("invalid_token"));
        assertEquals("/not-allowed?reason=error", redirect(exception));
    }

    @Test
    void otherAuthenticationException() throws Exception {
        assertEquals("/not-allowed?reason=error", redirect(new BadCredentialsException("bad")));
    }
}
