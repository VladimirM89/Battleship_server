import { ShipType } from "../constants/enums/webSocket";

export interface AddPlayerToRoomRequest {
  indexRoom: number;
}

export interface PlayerInRoom {
  name: string;
  index: number;
}

export interface UpdateRoomsResponse {
  roomId: number;
  roomUsers: Array<PlayerInRoom>;
}

export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: ShipType;
}

export interface AddShipsRequest {
  gameId: number;
  ships: Array<Ship>;
  indexPlayer: number;
}
