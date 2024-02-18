import { WebSocket } from "ws";

export interface PlayerRequest {
  name: string;
  password: string;
}

export interface PlayerResponse {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
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
