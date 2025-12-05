-- Création des utilisateurs
CREATE USER air_user WITH PASSWORD 'air1922';
CREATE USER mobility_user WITH PASSWORD 'mobility1922';

-- Création des bases
CREATE DATABASE air_db OWNER air_user;
CREATE DATABASE mobility_db OWNER mobility_user;

-- Donner tous les privilèges aux utilisateurs sur leurs bases
GRANT ALL PRIVILEGES ON DATABASE air_db TO air_user;
GRANT ALL PRIVILEGES ON DATABASE mobility_db TO mobility_user;
