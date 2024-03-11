import playersOnline from "../db/playersOnline";
import commonRequestResponse from "../models/commonRequestResponse";

export function sendToAll(response: commonRequestResponse) {
  const players = playersOnline.getAllOnlinePlayers();
  players.forEach((players) => players.webSocket.send(JSON.stringify(response)));
}

export function sendInRoom(playersId: Array<number>, response: commonRequestResponse) {
  playersId.forEach((playerId) => {
    const player = playersOnline.findOnlinePlayerById(playerId);
    if (player) {
      player.webSocket.send(JSON.stringify(response));
    }
  });
}
