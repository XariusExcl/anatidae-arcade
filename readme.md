# Anatidae Arcade

## Introduction

Anatidae Arcade est la WebUI de la borne d'arcade Anatidae. Elle permet de :
- Sélectionner des jeux WebGL présents dans le dossier `public/`,
- Stocker et récupérer des highscores au travers d'une [API](#5-documentation-de-lapi), ainsi que des données arbitraires "key-value" (appelées *extradata*),
- Afficher les métadonnées sur un jeu : 
- Jouer des vidéos "Attract mode" lorsque la borne n'est pas utilisée,
- Servir le dossier `StreamingAssets/` d'un jeu s'il est présent (Unity).

## Sommaire

1. [Informations sur la borne](#1-informations-sur-la-borne)
2. [Installation de la WebUI en local](#2-installation-de-la-webui-en-local)
3. [Utilisation](#3-utilisation)
4. [Déploiement d’un jeu sur Anatidae](#4-déploiement-dun-jeu-sur-anatidae)
5. [Documentation de l'API](#5-documentation-de-lapi)

## 1. Informations sur la borne

### Machine :
- La borne d'arcade est un PC i5-7200u, 8Go de RAM et sans GPU dédié, fonctionnant sous Debian 12.
- Le navigateur utilisé pour la WebUI est Firefox ESR.
- L'écran a une définition de 1920x1080, pour 24 pouces de diagonale.

> [!NOTE]
> La puissance graphique étant limitée, il est possible de faire fonctionner des jeux en 3D seulement s'ils sont simples ou correctement optimisés.

### Input joueur :
- 2 Joueurs, avec pour chacun :
  - **1 Joystick 2-axes** (axis 0, axis 1),
  - **7 boutons** (0, 1, 2, 3, 4, 5, 6).
Le bouton "Start" (bouton blanc) est attribué au **bouton 8 du premier contrôleur**.

<img height="450" alt="buttons" src="https://github.com/user-attachments/assets/a076e2b7-b468-40dc-ad31-cf649f92b45a" />

> [!IMPORTANT]
> La position neutre du joystick est `-0.00392; -0.00392`. Il est donc nécessaire d'implémenter une ***dead zone*** pour éviter un petit mouvement lorque le joystick est en position centrale.

> [!TIP]
> Vous pouvez voir l'attribution des boutons et joysticks de votre manette avec le site [Hardware Tester](https://hardwaretester.com/gamepad).

## 2. Installation de la WebUI en local
1. Avoir `NodeJS` et `npm` installés,
2. Cloner le repo,
3. Dans le dossier racine, ouvrir un terminal et lancez la commande : `npm install`.

## 3. Utilisation
Ouvrez un terminal dans le dossier racine et démarrez la WebUI avec la commande : `node server.js`. Elle sera accessible à l'addresse [localhost:3000](http://localhost:3000).

## 4. Déploiement d’un jeu sur Anatidae

Pour déployer un jeu sur la borne d'arcade, créez un dossier dans le dossier `public/` nommé avec le nom de votre jeu. Ce dossier contiendra tous vos fichiers nécessaires au fonctionnement de votre jeu.

### Fonctionnalités requises :

> [!CAUTION]
> Pour être accepté sur la borne, votre jeu doit impérativement implémenter <ins>à tout moment :</ins>
> - Le retour au menu principal lors de l'appui du **bouton blanc** (instantanément, ou sur un appui long de max 1.5s)
> - Un retour automatique si aucun bouton ou joystick n'a éte touché pendant **60 secondes**.

Le retour au menu se fait en modifiant `window.location.href` par [localhost:3000](http://localhost:3000).

### Fichiers requis :

Chaque jeu mis sur la borne a besoin de ces 3 fichiers pour fonctionner correctement :

- **index.html** : La page qui contient votre jeu.
- **thumbnail.png :** L’image de couverture de votre jeu, affichée en fond et en miniature sur l'interface (privilégiez un format carré avec une résolution de max de 1920x1920).
- **info.json :** Les informations de votre jeu, vu en détail ci-dessous.

<img height="320" alt="data" src="https://github.com/user-attachments/assets/6f8ccb5a-879b-40e7-9ee0-6da9914239d2" />

### info.json

Le fichier info.json stocke les métadonnées de votre jeu. Il doit être structuré de cette manière :

```yaml
name: string
description: string
creator: string
year: number
type: string
players: string
# optionnel
catchphrase: string
config: object
  scoreType: string ("time", "distance" ou "score")
  # optionnel
  scoreUnit: string (utilisé pour "distance" : 'm', 'km'...)
  scoreSort: string ("asc" ou "desc")
```

Voici un exemple que vous pouvez utiliser :

```json
{
  "name": "",
  "description": "",
  "creator": "",
  "year": 2025,
  "type": "",
  "players": "",
  "catchphrase": "Jouez maintenant !",
  "config": {
    "scoreType": "score",
    "scoreUnit": "",
    "scoreSort": "desc"
  }
}
```

### Fichiers optionnels :

Optionnellement, vous pouvez mettre un fichier **attract.mp4** dans le dossier de votre jeu pour afficher une courte vidéo trailer de **20 secondes max** :

<img height="320" alt="attract" src="https://github.com/user-attachments/assets/469efe80-9a61-4598-99b6-65ff31918e33" />

> [!NOTE]
> Les vidéos sont jouées sans son. Il n'est donc pas nécessaire de faire du sound design.

## 5. Documentation de l'API

- (type GET) `/api/?game={gameName}` 
  - Returns the highscores as an array of objects : `[{ name:string, score:number, timestamp:number }, {...}]`,
  - Returns `{ error: string }` on bad requests (400).

- (type GET) `/api/extradata/?game={gameName}` 
  - Returns all the extradata stored (if exists),
  - Returns `{ error: string }` on bad requests (400).

- (type GET) `/api/playcount/?game={gameName}` 
  - Returns the playcount as an object `{ playcount: number }`,
  - Returns `{ error: string }` on bad requests (400).

- (type POST) `/api/nameValid` (Body: `{ name:string }`) 
  - Returns `{ valid: true }` if name is allowed,
  - Returns `{ valid: false }` if name isn't allowed,
  - Returns `{ error: string }` on bad requests (400).

- (type POST) `/api/?game={gameName}` (Body: `{ name:string, score:number }`)
  - Returns `{ success: true }` on success,
  - Returns `{ success: false }` if existing highscore is higher,
  - Returns `{ error: string }` on bad requests (400).

- (type POST) `/api/extradata/?game={gameName}` (Body: `{ key:string, value:string }`)
  - Returns `{ success: true }` on success,
  - Returns `{ error: string }` on bad requests (400).
