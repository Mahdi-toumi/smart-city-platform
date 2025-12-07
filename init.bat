@echo off
echo 🚀 Démarrage de la plateforme...

docker-compose up -d --build

echo 🌱 Exécution du seed...
docker exec -it energy-service npm run seed

echo ✅ Initialisation terminée !
pause
