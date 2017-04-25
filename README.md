# battle-stations

## Overview
We are doing a collaborative game. It is....


## Architecure
- Backend: nodejs + express
- Frontend: pixi.js (Graphics)

## Team
- Simon: Frontend, Graphics
- Thomas: Backend + Docker
- Marvin: Frontend + Communication
- Sebastian: Backend
- Laura: Frontend

## Implemented Design Pattern - Mediator
- it has been very difficult to implement the design pattern because of the protocol and game-serialization which already worked like a kind of Mediator
- to fullfil the task I implemented a mediator between the game-manager-new and the displaySocket. So the protocol can be easily replaced for the game-manager
- In addition the game-manger does not need an instance of the server itself
- Backendtest for mediator (mediator.spec.js) tests if the mediator has a game, a server and if the game knows the mediator

## How to
- cd app/
- npm install
- npm test - backend tests
- npm start
- open http://localhost:3000/test_frontend.html
- finish game may fail because snakes are running in parallel
- stop server and try again ;)
