import WebSocket from "ws";
import { OnlinePlayer } from "../models/player";

function findWebSocket(playersOnline: Array<OnlinePlayer>, ws: WebSocket): OnlinePlayer | null {
  const result = playersOnline.find((item) => item.webSocket === ws);
  return result || null;
}

export default findWebSocket;
