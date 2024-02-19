import { ShipType } from "../constants/enums/webSocket";

interface ShipCoordinates {
  x: number;
  y: number;
}

interface Ship {
  position: ShipCoordinates;
  direction: boolean;
  length: number;
  type: keyof typeof ShipType;
}

export interface Game {
  gameId: number;
  players: Array<{
    ships?: Array<Ship>;
    indexPlayer: number;
  }>;
  currentPlayer: number;
}
