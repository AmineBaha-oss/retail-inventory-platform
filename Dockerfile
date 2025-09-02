# Railway root Dockerfile - This will deploy the Spring Boot API by default
# For multi-service deployment, use railway.json configuration

FROM maven:3.9.6-eclipse-temurin-21 as build

# Set working directory
WORKDIR /app

# Copy pom.xml first for better layer caching
COPY backend/pom.xml .

# Download dependencies (this layer will be cached if pom.xml doesn't change)
RUN mvn -q -e -DskipTests dependency:go-offline

# Copy source code
COPY backend/src ./src

# Build the application
RUN mvn -q -DskipTests package

# Runtime stage
FROM eclipse-temurin:21-jre

# Set working directory
WORKDIR /app

# Copy the built jar from build stage
COPY --from=build /app/target/retail-inventory-platform-1.0.0.jar app.jar

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
