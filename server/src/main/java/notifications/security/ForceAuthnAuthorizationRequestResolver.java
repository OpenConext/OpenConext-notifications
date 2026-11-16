package notifications.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * Adds prompt=login (force authentication) to the authorization request when the
 * request to /oauth2/authorization/{registrationId} has the parameter force=true.
 */
public class ForceAuthnAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

    private final OAuth2AuthorizationRequestResolver delegate;

    public ForceAuthnAuthorizationRequestResolver(ClientRegistrationRepository repository) {
        this.delegate = new DefaultOAuth2AuthorizationRequestResolver(repository, "/oauth2/authorization");
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        return customize(delegate.resolve(request), request);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        return customize(delegate.resolve(request, clientRegistrationId), request);
    }

    private OAuth2AuthorizationRequest customize(OAuth2AuthorizationRequest authorizationRequest,
                                                 HttpServletRequest request) {
        if (authorizationRequest == null || !Boolean.parseBoolean(request.getParameter("force"))) {
            return authorizationRequest;
        }
        Map<String, Object> parameters = new HashMap<>(authorizationRequest.getAdditionalParameters());
        parameters.put("prompt", "login");
        return OAuth2AuthorizationRequest.from(authorizationRequest).additionalParameters(parameters).build();
    }
}
