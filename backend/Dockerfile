# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy Maven Wrapper & POM
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw

# Download dependencies (offline cache layer)
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and package
COPY src ./src
RUN ./mvnw package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy compiled jar from build stage
COPY --from=build /app/target/medvault-backend-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
