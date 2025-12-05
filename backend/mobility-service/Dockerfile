# Étape 1 : Build (Compilation)
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# On package l'application en sautant les tests pour aller plus vite au build
RUN mvn clean package -DskipTests

# Étape 2 : Run (Image finale légère)
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]