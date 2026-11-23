FROM ghcr.io/openconext/openconext-basecontainers/java21:latest

COPY target/*.jar app.jar

# the container port: the client image proxies to it and the healthcheck uses it (local runs use 8082)
ENV SERVER_PORT=8080

HEALTHCHECK \
    --interval=10s \
    --timeout=10s \
    --start-period=10s \
    --retries=3 \
    CMD ["wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/internal/health"]

ENTRYPOINT ["java","-jar","/app.jar"]
