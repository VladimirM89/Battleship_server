import { Room } from "../models/room";

class RoomService {
  private rooms: Array<Room>;

  constructor() {
    this.rooms = [
      {
        roomId: 346146,
        roomUsers: [{ index: 5555, name: "Vladimir" }],
      },
      {
        roomId: 3888,
        roomUsers: [{ index: 5777, name: "Vova" }],
      },
    ];
  }

  public getAllRooms(): Array<Room> {
    return this.rooms;
  }

  // public addPlayerToRoom(player) {
  //   this.rooms.push();
  // }
}

export default RoomService;
