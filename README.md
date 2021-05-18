# [FR] Discord Spiritbox

Un bot Discord avec reconnaissance vocale. Objectif : faire une spiritbox comme celle du jeu Phasmophobia.

Suite à un raid Twitch de Grafikart pendant le live coding de ce projet, je l'open source pour clarifier certains points pour les retardataires. Merci Grafikart. <3

![Youpi](Trophee_pour_Ilshi.PNG)

## Comment démarrer le projet

Il est juste nécessaire d'avoir [Docker](https://www.docker.com) et [Docker compose](https://docs.docker.com/compose) installés sur voter machine.

**1ère étape :** Copier le fichier `.env.dist` vers un nouveau `.env` et ajouter le token Discord après le `=`.

```bash
docker-compose up --build
```

## Fonctionnement

La reconnaissance vocale se fait via [Vosk](https://alphacephei.com/vosk) et la communication à son container Docker associé se fait via le protocole WebSocket.
