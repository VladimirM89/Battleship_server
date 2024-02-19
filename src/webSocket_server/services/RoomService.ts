/* eslint-disable class-methods-use-this */
import { PlayerInDB } from "../models/player";
import { PlayerInRoom, Room } from "../models/room";
import generateNumberId from "../utils/generateNumberId";

class RoomService {
  private rooms: Array<Room>;

  constructor() {
    this.rooms = [];
  }

  public getAllRooms(): Array<Room> {
    return this.rooms;
  }

  public addPlayerToRoom(room: Room, player: PlayerInDB): boolean {
    const checkPlayersIsDifferent = room.roomUsers[0].index === player.index;

    if (!checkPlayersIsDifferent) {
      room.roomUsers.push({ index: player.index, name: player.name });
      this.deleteAllRoomsWithPlayer(room.roomUsers);
      return true;
    }
    return false;
  }

  public createRoomWithPlayer(player: PlayerInDB) {
    const newRoom: Room = {
      roomId: generateNumberId(),
      roomUsers: [
        {
          index: player.index,
          name: player.name,
        },
      ],
    };
    const roomWithPlayerExist = this.rooms.find((room) => room.roomUsers[0].index === player.index);

    if (!roomWithPlayerExist) {
      this.rooms.push(newRoom);
    }
  }

  private deleteRoom(room: Room): void {
    const index = this.rooms.indexOf(room);
    this.rooms.splice(index, 1);
  }

  private deleteAllRoomsWithPlayer(players: Array<PlayerInRoom>) {
    players.forEach((player) => {
      console.log("PLAYER: ", player.name, player.index);
      const { index } = player;
      this.rooms.forEach((room) => {
        console.log("ROOM: ", room.roomUsers);
        if (room.roomUsers[0].index === index || room.roomUsers[1]?.index === index) {
          console.log("ROOM DELETE: ", room);
          this.deleteRoom(room);
        }
      });
    });
  }

  public findRoomByIndex(index: number): Room | null {
    return this.rooms.find((room) => room.roomId === index) || null;
  }
}

export default RoomService;
