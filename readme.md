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
  - Returns the highscores as an array of objects : `[{ name:string, score:number, timestamp:number }, {...}]`.
  - Returns `{ error: string }` on bad requests (400)

- `/api/extradata/?game={gameName}`
  - Returns the extra data object stored (if exists).
  - Returns `{ error: string }` on bad requests (400)

- `/api/playcount/?game={gameName}`
  - Returns the playcount as an object `{ playcount: number }`.
  - Returns `{ error: string }` on bad requests (400)

### Request type: POST

- `/api/nameValid` (Body: `{ name:string }`)
  - Returns `{ valid: true }` if name is allowed
  - Returns `{ valid: false }` if name isn't allowed
  - Returns `{ error: string }` on bad requests (400)

- `/api/?game={gameName}` (Body: `{ name:string, score:number }`)
  - Returns `{ success: true }` on success
  - Returns `{ success: false }` if existing highscore is higher
  - Returns `{ error: string }` on bad requests (400)


- `/api/extradata/?game={gameName}` (Body: `object`)
  - Returns `{ success: true }` on success
  - Returns `{ error: string }` on bad requests (400)