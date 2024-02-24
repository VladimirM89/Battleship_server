import { WebSocket } from "ws";
import { ShotStatus } from "../constants/enums/webSocket";
import { Ship } from "./room";

export interface CreateGameResponse {
  idGame: number;
  idPlayer: number;
}

export interface StartGameResponse {
  ships: Array<Ship>;
  currentPlayerIndex: number;
}

export interface AttackRequest {
  gameId: number;
  x: number;
  y: number;
  indexPlayer: number;
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface AttackFeedbackResponse {
  position: Coordinates;
  currentPlayer: number;
  status: keyof typeof ShotStatus;
}

export interface RandomAttackRequest {
  gameId: number;
  indexPlayer: number;
}

export interface PlayerTurnResponse {
  currentPlayer: number;
}

export interface FinishResponse {
  winPlayer: number;
}

export interface GamePlayer {
  indexPlayer: number;
  webSocket: WebSocket;
  ships: Array<Ship>;
  shots?: Array<Coordinates>;
}

export interface Game {
  gameId: number;
  players: Array<GamePlayer>;
  currentPlayerIndex: number;
}
