# Utilise une image Node officielle
FROM node:18

# Dossier de travail dans le conteneur
WORKDIR /app

# Copie le package.json et package-lock.json
COPY package*.json ./

# Installe les dépendances  
RUN npm install

# Copie tous les fichiers du projet
COPY . .

# Expose le port sur lequel ton serveur écoute
EXPOSE 3000

# Démarre le serveur
CMD ["node", "server.js"]
