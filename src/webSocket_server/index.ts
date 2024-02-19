/* eslint-disable import/no-cycle */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-case-declarations */
import { WebSocketServer } from "ws";
import { WEBSOCKET_HOST, WEBSOCKET_PORT } from "./constants/webSocketConstants";
import { WEBSOCKET_START_TEXT } from "./constants/constants";
import { Type } from "./constants/enums/webSocket";
import { PlayerRequest } from "./models/player";
import commonRequestResponse from "./models/commonRequestResponse";
import Players from "./db/players";
import findWebSocket from "./utils/findWebSocket";
import OnlinePlayers from "./db/onlinePlayers";
import generateStringId from "./utils/generateStringId";
import RoomService from "./services/RoomService";

const wss = new WebSocketServer({ port: WEBSOCKET_PORT, host: WEBSOCKET_HOST });
console.log(`${WEBSOCKET_START_TEXT} ${WEBSOCKET_HOST}: ${WEBSOCKET_PORT}`);

export const playersOnline = new OnlinePlayers();

const players = new Players();

const rooms = new RoomService();

wss.on("connection", (ws) => {
  ws.on("message", function message(rawData) {
    const request: commonRequestResponse = JSON.parse(rawData.toString());
    console.log("received: ", request);

    switch (request.type) {
      case Type.REG:
        const loginData: PlayerRequest = JSON.parse(request.data);

        const playerDataResponse = players.handlePlayerLogin(loginData);

        const response: commonRequestResponse = {
          type: Type.REG,
          data: JSON.stringify(playerDataResponse),
          id: 0,
        };

        const player = players.findPlayer(loginData);

        if (player && !playerDataResponse.error) {
          const newOnlinePlayer = {
            id: generateStringId(),
            webSocket: ws,
            player,
          };

          playersOnline.addOnlinePlayer(newOnlinePlayer);

          ws.send(JSON.stringify(response));

          console.log(
            `Player '${newOnlinePlayer.player.name}' is online. Websocket id=${newOnlinePlayer.id}`,
          );

          ws.send(
            JSON.stringify({
              type: Type.UPDATE_ROOM,
              data: JSON.stringify(rooms.getAllRooms()),
              id: 0,
            }),
          );

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

        // console.log(
        //   `Online users: `,
        //   playersOnline.getAllOnlinePlayers().length,
        //   playersOnline.getAllOnlinePlayers(),
        // );
        break;

      case Type.CREATE_ROOM:
        ws.send(
          JSON.stringify({
            type: "add_user_to_room",
            data: JSON.stringify({
              indexRoom: 6546544,
            }),
            id: 0,
          }),
        );

        break;

      default:
        break;
    }
  });

  ws.on("error", console.error);

  ws.on("close", () => {
    const result = findWebSocket(playersOnline.getAllOnlinePlayers(), ws);
    if (result) {
      playersOnline.deleteOnlinePlayer(result);
      console.log(
        `Player '${result.player.name}' is offline. Websocket id=${result.id} disconnected`,
      );
    } else {
      ws.close();
      console.log(`Websocket disconnected`);
    }
    // console.log(
    //   "Open socket number: ",
    //   playersOnline.getAllOnlinePlayers().length,
    //   playersOnline.getAllOnlinePlayers(),
    // );
  });
});
