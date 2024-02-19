export interface PlayerInRoom {
  name: string;
  index: number;
}

export interface Room {
  roomId: number;
  roomUsers: Array<PlayerInRoom>;
}
