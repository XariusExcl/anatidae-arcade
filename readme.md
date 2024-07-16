# Anatidae Arcade

The backend for Anatidae.

## Prerequisites 
- NodeJS, npm

## Install
- npm install
- create a public/ folder in the root

## Usage
start server with `node server.js`

## API Documentation

- `/api/{gameName}` : GET
  - Returns `{error: [error description] }` on bad requests (400)
  - Returns the highscores in a key-value array.

- `/api/{gameName}` : POST (Body: `{name:string, score:number}`)
  - Returns `{error: [error description] }` on bad requests (400)
  - Returns `{success: false}` if existing highscore is higher
  - Returns `{success: true}` on success
