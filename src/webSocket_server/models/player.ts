import { WebSocket } from "ws";

export interface UpdateWinnersResponse {
  name: string;
  wins: number;
}

export interface PlayerInDB {
  index: number;
  name: string;
  password: string;
  wins: number;
}

export interface OnlinePlayer {
  id: string;
  webSocket: WebSocket;
  player: PlayerInDB;
}
