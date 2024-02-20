/* eslint-disable import/no-cycle */
import { playersOnline } from "..";
import { Type } from "../constants/enums/webSocket";
import commonRequestResponse from "../models/commonRequestResponse";
import { CreateGameResponse, Game, GamePlayer, StartGameResponse } from "../models/game";
import { AddShipsRequest } from "../models/room";
import generateNumberId from "../utils/generateNumberId";

class GameService {
  private game: Game;
  // private currentPlayer: number;

  constructor() {
    this.game = { gameId: generateNumberId(), players: [] };
  }

  public createGame() {
    const gameIndex = generateNumberId();
    if (this.game.players.length === 2) {
      this.game.players.forEach((item) => {
        const createGameResponse: CreateGameResponse = {
          idGame: gameIndex,
          idPlayer: item.indexPlayer,
        };
        const response: commonRequestResponse = {
          type: Type.CREATE_GAME,
          data: JSON.stringify(createGameResponse),
          id: 0,
        };
        item.webSocket.send(JSON.stringify(response));
      });
    }
  }

  public addPlayerToGame(data: Omit<GamePlayer, "ships">) {
    const player = playersOnline.findOnlinePlayerById(data.indexPlayer);
    if (player && this.game.players.length < 2) {
      const playerInGame: GamePlayer = {
        indexPlayer: player.player.index,
        ships: [],
        webSocket: player.webSocket,
      };
      this.game.players.push(playerInGame);
    }
  }

  public addShipsToPlayers(data: AddShipsRequest) {
    this.game.players.forEach((player) => {
      if (player.indexPlayer === data.indexPlayer) {
        player.ships.push(...data.ships);
      }
    });
  }

  public startGame() {
    if (
      this.game.players.length === 2 &&
      !!this.game.players[0].ships.length &&
      !!this.game.players[1].ships.length
    ) {
      this.game.players.forEach((item) => {
        const responseData: StartGameResponse = {
          ships: item.ships,
          currentPlayerIndex: item.indexPlayer,
        };
        const startGameResponse: commonRequestResponse = {
          type: Type.START_GAME,
          data: JSON.stringify(responseData),
          id: 0,
        };
        item.webSocket.send(JSON.stringify(startGameResponse));
      });
    }
  }

  // private changePlayer() {
  //   console.log("Change player");
  // }

  // private finishGame() {
  //   console.log("Game finished");
  //   console.log("Update Winners");
  // }
}

export default GameService;
