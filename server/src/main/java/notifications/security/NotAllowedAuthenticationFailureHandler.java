package notifications.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import java.io.IOException;

/**
 * Users that are not a member of the required group are sent to the GUI page /not-allowed. Other
 * login failures go to the GUI as well, with a generic error page.
 */
public class NotAllowedAuthenticationFailureHandler implements AuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        boolean notAMember = exception instanceof OAuth2AuthenticationException oauth
                && CustomOidcUserService.NOT_A_MEMBER.equals(oauth.getError().getErrorCode());
        response.sendRedirect(request.getContextPath() + (notAMember ? "/not-allowed" : "/not-allowed?reason=error"));
    }
}
