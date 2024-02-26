import { WebSocketServer } from "ws";
import { WEBSOCKET_HOST, WEBSOCKET_PORT } from "./constants/webSocketConstants";
import {
  CLIENT_DISCONNECT_TEXT,
  ERROR_HANDLE_REQUEST_TEXT,
  RESTART_WS_SERVER,
  SERVER_ERROR_TEXT,
  WEBSOCKET_START_TEXT,
} from "./constants/constants";
import { Type } from "./constants/enums/webSocket";
import commonRequestResponse from "./models/commonRequestResponse";
import generateStringId from "./utils/generateStringId";
import { LoginRequest } from "./models/registration";
import { AddPlayerToRoomRequest, AddShipsRequest } from "./models/room";
import { OnlinePlayer } from "./models/player";
import { AttackRequest, RandomAttackRequest } from "./models/game";
import playersOnline from "./db/playersOnline";
import players from "./db/players";
import rooms from "./db/rooms";
import games from "./db/games";

const wss = new WebSocketServer({ port: WEBSOCKET_PORT, host: WEBSOCKET_HOST });
console.log(`${WEBSOCKET_START_TEXT} ${WEBSOCKET_HOST}: ${WEBSOCKET_PORT}`);

try {
  wss.on("connection", (ws) => {
    ws.on("message", function message(rawData) {
      const request: commonRequestResponse = JSON.parse(rawData.toString());
      const requestRawData: unknown = request.data.length ? JSON.parse(request.data) : request.data;

      try {
        switch (request.type) {
          case Type.REG:
            {
              console.log(`Receive request: `, Type.REG);
              const loginData = requestRawData as LoginRequest;
              const playerDataResponse = players.handlePlayerLogin(loginData);

              const response: commonRequestResponse = {
                type: Type.REG,
                data: JSON.stringify(playerDataResponse),
                id: 0,
              };
              console.log(`Send response: `, Type.REG);

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
                players.updateWinners();
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
              console.log(`Receive request: `, Type.ADD_USER_TO_ROOM);
              const { indexRoom } = requestRawData as AddPlayerToRoomRequest;
              const roomToAddNewPlayer = rooms.findRoomByIndex(indexRoom);
              const newPlayer = playersOnline.findOnlinePlayerByWs(ws)!.player;
              const isPlayerAlreadyInRoom = rooms.addPlayerToRoom(roomToAddNewPlayer!, newPlayer);

              if (!isPlayerAlreadyInRoom) {
                break;
              }
              roomToAddNewPlayer?.roomUsers.forEach((item) => {
                const playerInRoom = playersOnline.findOnlinePlayerById(item.index);
                if (playerInRoom) {
                  games.addPlayerToGame(
                    {
                      indexPlayer: playerInRoom.player.index,
                      webSocket: playerInRoom.webSocket,
                    },
                    indexRoom,
                  );
                }
              });

              games.sendCreateGame(indexRoom);
              rooms.updateRooms();
            }

            break;

          case Type.ADD_SHIPS:
            {
              console.log(`Receive request: `, Type.ADD_SHIPS);
              const requestData = requestRawData as AddShipsRequest;
              games.addShipsToPlayers(requestData);
              games.startGame(requestData.gameId);
            }

            break;

          case Type.ATTACK:
            {
              console.log(`Receive request: `, Type.ATTACK);
              const attackRequest = requestRawData as AttackRequest;
              games.receiveAttack(attackRequest);
            }
            break;

          case Type.RANDOM_ATTACK:
            {
              console.log(`Receive request: `, Type.RANDOM_ATTACK);
              const randomAttackRequest = requestRawData as RandomAttackRequest;
              games.handleRandomAttack(randomAttackRequest);
            }
            break;

          case Type.SINGLE_PLAY:
            {
              console.log(`Receive request: `, Type.SINGLE_PLAY);
              const currentPlayer = playersOnline.findOnlinePlayerByWs(ws);
              if (currentPlayer) {
                games.handleGameWithBot({
                  indexPlayer: currentPlayer.player.index,
                  webSocket: ws,
                });
              }
            }
            break;

          default:
            break;
        }
      } catch {
        console.log(ERROR_HANDLE_REQUEST_TEXT);
      }
    });

    ws.on("error", () => {
      console.log(SERVER_ERROR_TEXT);
      wss.removeAllListeners();
      wss.close();
      console.log(RESTART_WS_SERVER);
    });

    ws.on("close", () => {
      const exitPlayer = playersOnline.findOnlinePlayerByWs(ws);
      if (exitPlayer) {
        playersOnline.deleteOnlinePlayer(exitPlayer);
        games.handlePlayerExit(exitPlayer.player.index);
        rooms.deleteAllRoomsWithPlayer([exitPlayer.player]);

        console.log(
          `Player '${exitPlayer.player.name}' is offline. Websocket id=${exitPlayer.id} disconnected`,
        );
      } else {
        console.log(CLIENT_DISCONNECT_TEXT);
      }
      ws.close();
    });
  });
} catch {
  console.log(SERVER_ERROR_TEXT);
}
