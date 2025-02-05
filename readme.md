# Anatidae Arcade

The backend for Anatidae.

## Prerequisites 
- NodeJS, npm

## Installation
- `npm install`

## Usage
Start server with `node server.js`

## API Documentation

### Request type: GET
- `/api/?game={gameName}`
  - Returns `{ error: string }` on bad requests (400)
  - Returns the highscores as an array of objects : `[{ name:string, score:number, timestamp:number }, {...}]`.

- `/api/extradata/?game={gameName}`
  - Returns `{ error: string }` on bad requests (400)
  - Returns the extra data object stored (if exists).

- `/api/playcount/?game={gameName}`
  - Returns `{ error: string }` on bad requests (400)
  - Returns the playcount as an object `{ playcount: number }`.

### Request type: POST

- `/api/?game={gameName}` (Body: `{ name:string, score:number }`)
  - Returns `{ error: string }` on bad requests (400)
  - Returns `{ success: false }` if existing highscore is higher
  - Returns `{ success: true }` on success


- `/api/extradata/?game={gameName}` (Body: `object`)
  - Returns `{ error: string }` on bad requests (400)
  - Returns `{ success: true }` on success