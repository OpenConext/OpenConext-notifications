FROM ghcr.io/openconext/openconext-basecontainers/java21:latest

# The jar contains the Spring Boot server and the built client
COPY target/*.jar app.jar

HEALTHCHECK \
    --interval=10s \
    --timeout=10s \
    --start-period=30s \
    --retries=3 \
    CMD ["wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8082/actuator/health"]

ENTRYPOINT ["java","-jar","/app.jar"]
