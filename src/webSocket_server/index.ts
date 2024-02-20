/* eslint-disable import/no-cycle */
/* eslint-disable import/prefer-default-export */
import { WebSocketServer } from "ws";
import { WEBSOCKET_HOST, WEBSOCKET_PORT } from "./constants/webSocketConstants";
import { WEBSOCKET_START_TEXT } from "./constants/constants";
import { Type } from "./constants/enums/webSocket";
import commonRequestResponse from "./models/commonRequestResponse";
import Players from "./db/players";
import OnlinePlayers from "./db/onlinePlayers";
import generateStringId from "./utils/generateStringId";
import RoomService from "./services/RoomService";
import { LoginRequest } from "./models/registration";
import { AddPlayerToRoomRequest, AddShipsRequest } from "./models/room";
import { OnlinePlayer } from "./models/player";
import GameService from "./services/GameService";

const wss = new WebSocketServer({ port: WEBSOCKET_PORT, host: WEBSOCKET_HOST });
console.log(`${WEBSOCKET_START_TEXT} ${WEBSOCKET_HOST}: ${WEBSOCKET_PORT}`);

export const playersOnline = new OnlinePlayers();

const players = new Players();

const rooms = new RoomService();

const game = new GameService();

wss.on("connection", (ws) => {
  ws.on("message", function message(rawData) {
    const request: commonRequestResponse = JSON.parse(rawData.toString());
    console.log("received: ", request);

    const requestRawData: unknown = request.data.length ? JSON.parse(request.data) : request.data;

    switch (request.type) {
      case Type.REG:
        {
          const loginData = requestRawData as LoginRequest;
          const playerDataResponse = players.handlePlayerLogin(loginData);

          const response: commonRequestResponse = {
            type: Type.REG,
            data: JSON.stringify(playerDataResponse),
            id: 0,
          };

          const player = players.findPlayer(loginData);

          if (player && !playerDataResponse.error) {
            const newOnlinePlayer: OnlinePlayer = {
              id: generateStringId(),
              webSocket: ws,
              player,
            };

            playersOnline.addOnlinePlayer(newOnlinePlayer);

            ws.send(JSON.stringify(response));

            console.log(
              `Player '${newOnlinePlayer.player.name}' is online. Websocket id=${newOnlinePlayer.id}`,
            );

            rooms.updateRooms();

            ws.send(
              JSON.stringify({
                type: Type.UPDATE_WINNERS,
                data: JSON.stringify(players.getPlayersWithWins()),
                id: 0,
              }),
            );
          } else {
            ws.send(JSON.stringify(response));
          }
        }
        break;

      case Type.CREATE_ROOM:
        {
          const currentPlayer = playersOnline.findOnlinePlayerByWs(ws);
          if (currentPlayer) {
            rooms.createRoomWithPlayer(currentPlayer.player);
          }

          rooms.updateRooms();
        }
        break;

      case Type.ADD_USER_TO_ROOM:
        {
          const { indexRoom } = requestRawData as AddPlayerToRoomRequest;
          const currentRoom = rooms.findRoomByIndex(indexRoom);
          const currPlayer = playersOnline.findOnlinePlayerByWs(ws)!.player;
          const isPlayerAddedInRoom = rooms.addPlayerToRoom(currentRoom!, currPlayer);
          if (!isPlayerAddedInRoom) {
            break;
          }
          currentRoom?.roomUsers.forEach((item) => {
            const playerInRoom = playersOnline.findOnlinePlayerById(item.index);
            if (playerInRoom) {
              game.addPlayerToGame({
                indexPlayer: playerInRoom.player.index,
                webSocket: playerInRoom.webSocket,
              });
            }
          });

          game.createGame();
          rooms.updateRooms();
        }

        break;

      case Type.ADD_SHIPS:
        {
          const requestData = requestRawData as AddShipsRequest;
          game.addShipsToPlayers(requestData);
          game.startGame();
        }

        break;

      default:
        break;
    }
  });

  ws.on("error", console.error);

  ws.on("close", () => {
    const result = playersOnline.findOnlinePlayerByWs(ws);
    if (result) {
      playersOnline.deleteOnlinePlayer(result);
      console.log(
        `Player '${result.player.name}' is offline. Websocket id=${result.id} disconnected`,
      );
    } else {
      ws.close();
      console.log(`Websocket disconnected`);
    }
  });
});
