import { Type } from "../constants/enums/webSocket";
import commonRequestResponse from "../models/commonRequestResponse";
import { PlayerInDB } from "../models/player";
import { PlayerInRoom, UpdateRoomsResponse } from "../models/room";
import generateNumberId from "../utils/generateNumberId";
import { sendToAll } from "../utils/sendResponse";

class RoomService {
  private rooms: Array<UpdateRoomsResponse>;

  constructor() {
    this.rooms = [];
  }

  public getAllRooms(): Array<UpdateRoomsResponse> {
    return this.rooms;
  }

  public addPlayerToRoom(room: UpdateRoomsResponse, player: PlayerInDB): boolean {
    const checkPlayersIsDifferent = room.roomUsers[0].index === player.index;

    if (!checkPlayersIsDifferent) {
      room.roomUsers.push({ index: player.index, name: player.name });
      this.deleteAllRoomsWithPlayer(room.roomUsers);
      return true;
    }
    return false;
  }

  public createRoomWithPlayer(player: PlayerInDB) {
    const newRoom: UpdateRoomsResponse = {
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
      console.log(`Send response: `, Type.ADD_USER_TO_ROOM);
    }
  }

  private deleteRoom(room: UpdateRoomsResponse): void {
    const index = this.rooms.indexOf(room);
    this.rooms.splice(index, 1);
    this.updateRooms();
  }

  public deleteAllRoomsWithPlayer(players: Array<PlayerInRoom>) {
    players.forEach((player) => {
      const { index } = player;
      this.rooms.forEach((room) => {
        if (room.roomUsers[0].index === index || room.roomUsers[1]?.index === index) {
          this.deleteRoom(room);
        }
      });
    });
  }

  public findRoomByIndex(index: number): UpdateRoomsResponse | null {
    return this.rooms.find((room) => room.roomId === index) || null;
  }

  public updateRooms() {
    const updateRoomsResponse: commonRequestResponse = {
      type: Type.UPDATE_ROOM,
      data: JSON.stringify(this.rooms),
      id: 0,
    };
    sendToAll(updateRoomsResponse);
    console.log(`Send response: `, Type.UPDATE_ROOM);
  }
}

export default RoomService;
