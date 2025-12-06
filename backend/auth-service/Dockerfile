# --- ÉTAPE 1 : BUILD (Compilation) ---
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# --- ÉTAPE 2 : RUN (Exécution) ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# ⚠️ IMPORTANT : Le port spécifique de l'Auth Service
EXPOSE 8089

ENTRYPOINT ["java", "-jar", "app.jar"]