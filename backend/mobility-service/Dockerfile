# --- ÉTAPE 1 : BUILD (Compilation) ---
# On utilise une image avec Maven et Java 17 complet
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Dossier de travail dans le conteneur
WORKDIR /app

# Copie du fichier de configuration Maven
COPY pom.xml .

# Copie du code source
COPY src ./src

# Compilation du projet (on saute les tests pour accélérer le build Docker)
RUN mvn clean package -DskipTests

# --- ÉTAPE 2 : RUN (Exécution) ---
# On repart d'une image vierge et légère (Alpine Linux + JRE seulement)
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# On récupère UNIQUEMENT le .jar généré à l'étape précédente
# Cela permet d'avoir une image finale de ~150Mo au lieu de ~800Mo
COPY --from=build /app/target/*.jar app.jar

# On documente le port exposé
EXPOSE 8081

# Commande de démarrage
ENTRYPOINT ["java", "-jar", "app.jar"]