# Anatidae Arcade

The backend for Anatidae.

## Prerequisites 
- NodeJS, npm

## Installation
- `npm install`

## Usage
Start server with `node server.js`

## API Documentation

- `/api/{gameName}` : GET
  - Returns `{error: [error description] }` on bad requests (400)
  - Returns the highscores as an array of objects `{name:string, score:number}`.

- `/api/{gameName}` : POST (Body: `{name:string, score:number}`)
  - Returns `{error: [error description] }` on bad requests (400)
  - Returns `{success: false}` if existing highscore is higher
  - Returns `{success: true}` on success
