package notifications.security;

import notifications.config.NotificationsProperties;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

import java.util.List;

/**
 * 1. ExternalApiSecurity: server-to-server API for the target apps, HTTP Basic.
 * 2. GuiSecurity: the GUI and its CRUD API, OIDC login (session) only. Access tokens (bearer) are not supported.
 */
@Configuration
public class SecurityConfiguration {

    @Configuration
    @Order(1)
    public static class ExternalApiSecurity {

        @Bean
        public SecurityFilterChain externalApiSecurityFilterChain(HttpSecurity http,
                                                                  NotificationsProperties properties) throws Exception {
            // The passwords are injected as plain text, so no password encoding
            List<UserDetails> users = properties.getTargetApps().stream()
                    .map(app -> User.withUsername(app.getName())
                            .password("{noop}" + app.getPassword())
                            .roles("TARGET_APP")
                            .build())
                    .toList();
            http.securityMatcher("/api/external/**")
                    .csrf(csrf -> csrf.disable())
                    .authorizeHttpRequests(auth -> auth.anyRequest().hasRole("TARGET_APP"))
                    .httpBasic(Customizer.withDefaults())
                    .userDetailsService(new InMemoryUserDetailsManager(users))
                    .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
            return http.build();
        }
    }

    @Configuration
    @Order(2)
    public static class GuiSecurity {

        @Bean
        public SecurityFilterChain guiSecurityFilterChain(HttpSecurity http, Environment environment,
                                                         ClientRegistrationRepository clientRegistrationRepository,
                                                         NotificationsProperties properties) throws Exception {
            http
                    .csrf(csrf -> csrf
                            .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                            .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
                    .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
                    .authorizeHttpRequests(auth -> auth
                            // the health (load balancer) and info endpoints are never secured
                            .requestMatchers("/internal/**").permitAll()
                            // the static GUI and the config (tells the GUI to login) are public as well
                            .requestMatchers("/api/**").authenticated()
                            .anyRequest().permitAll())
                    .oauth2Login(login -> login
                            .authorizationEndpoint(endpoint -> endpoint.authorizationRequestResolver(
                                    new ForceAuthnAuthorizationRequestResolver(clientRegistrationRepository)))
                            .userInfoEndpoint(userInfoEndpoint -> userInfoEndpoint.oidcUserService(
                                    new CustomOidcUserService(properties.getRequiredMemberOf())))
                            // the GUI shows a message to users that are not allowed
                            .failureHandler(new NotAllowedAuthenticationFailureHandler())
                            .defaultSuccessUrl("/", true))
                    // fetch calls from the GUI must get a 401 and not a redirect to the OIDC provider
                    .exceptionHandling(eh -> eh.defaultAuthenticationEntryPointFor(
                            new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                            PathPatternRequestMatcher.pathPattern("/api/**")))
                    .logout(logout -> logout.logoutSuccessHandler(
                            new HttpStatusReturningLogoutSuccessHandler(HttpStatus.OK)));
            if (environment.acceptsProfiles(Profiles.of("local"))) {
                http.addFilterBefore(new LocalDevelopmentAuthenticationFilter(), AnonymousAuthenticationFilter.class);
            }
            return http.build();
        }
    }
}
