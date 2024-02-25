# Websocket battleship server (RSSchool NodeJS websocket task)
> By default WebSocket client tries to connect to the 3000 port.

## Installation
  1. Clone repository: `git clone https://github.com/VladimirM89/Battleship_server.git`
  2. Switch to branch **develop** - `git checkout develop`
  3. Install dependencies: `npm install`

## Usage
**Development**

`npm run start:dev`

* App served @ `http://localhost:8181` with nodemon

**Production**

`npm run start`

* App served @ `http://localhost:8181` without nodemon

`npm run start:websocket`

* Websocket server served @ `ws://localhost:3000` with nodemon

`npm run build:websocket`

* Websocket server served @ `ws://localhost:3000` after bundle in one file

---

**All commands**

Command | Description
--- | ---
`npm run start:dev` | App served @ `http://localhost:8181` with nodemon
`npm run start` | App served @ `http://localhost:8181` without nodemon
`npm run start:websocket` | Websocket server served @ `ws://localhost:3000` with nodemon
`npm run build:websocket` | Websocket server served @ `ws://localhost:3000` after bundle in one file

