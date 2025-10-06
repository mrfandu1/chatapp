FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy maven wrapper and pom.xml
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# Make mvnw executable
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build application
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy built application from build stage
COPY --from=build /app/target/chatapp.jar app.jar

# Expose port
EXPOSE 8080

# Set environment variables
ENV SPRING_PROFILES_ACTIVE=prod

# Run application
ENTRYPOINT ["java", "-Dserver.port=${PORT:-8080}", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
