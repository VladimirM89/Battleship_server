/* eslint-disable import/no-cycle */
import { playersOnline } from "..";
import { ShotStatus, Type } from "../constants/enums/webSocket";
import commonRequestResponse from "../models/commonRequestResponse";
import {
  AttackFeedbackResponse,
  AttackRequest,
  CreateGameResponse,
  Game,
  GamePlayer,
  PlayerTurnResponse,
  StartGameResponse,
} from "../models/game";
import { AddShipsRequest } from "../models/room";
import generateNumberId from "../utils/generateNumberId";

class GameService {
  private game: Game;

  private currentPlayerIndex: number;

  constructor() {
    this.game = { gameId: generateNumberId(), players: [] };
    this.currentPlayerIndex = 0;
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
          currentPlayerIndex: this.currentPlayerIndex,
        };
        const startGameResponse: commonRequestResponse = {
          type: Type.START_GAME,
          data: JSON.stringify(responseData),
          id: 0,
        };
        item.webSocket.send(JSON.stringify(startGameResponse));
      });
      this.changePlayer();
    }
  }

  private changePlayer() {
    if (this.currentPlayerIndex === 0) {
      this.currentPlayerIndex = 1;
    } else {
      this.currentPlayerIndex = 0;
    }

    this.game.players.forEach((item) => {
      const responseData: PlayerTurnResponse = {
        currentPlayer: this.game.players[this.currentPlayerIndex].indexPlayer,
      };
      const turnPlayerResponse: commonRequestResponse = {
        type: Type.TURN,
        data: JSON.stringify(responseData),
        id: 0,
      };
      item.webSocket.send(JSON.stringify(turnPlayerResponse));
    });
  }

  // direction: false = horizontal
  // direction: true = vertical
  // x: 0 - 9 from left to right
  // y: 0- 9 from top to bottom

  public receiveAttack(attackRequest: AttackRequest) {
    const { gameId, x, y, indexPlayer } = attackRequest;

    const gamePlayers = this.game.players;

    if (indexPlayer !== gamePlayers[this.currentPlayerIndex].indexPlayer) {
      return;
    }

    const player = gamePlayers.find((item) => item.indexPlayer === indexPlayer);
    const enemy = gamePlayers.find((item) => item.indexPlayer !== indexPlayer);

    if (player && enemy) {
      enemy.ships.forEach((ship) => {
        if (x === ship.position.x || y === ship.position.y) {
          this.sendAttackFeedback(ShotStatus.SHOT, x, y);
        }
      });
    }
  }

  public sendAttackFeedback(status: string, x: number, y: number) {
    this.game.players.forEach((item) => {
      const responseData: AttackFeedbackResponse = {
        position: { x, y },
        currentPlayer: this.game.players[this.currentPlayerIndex].indexPlayer,
        status,
      };
      const turnPlayerResponse: commonRequestResponse = {
        type: Type.ATTACK,
        data: JSON.stringify(responseData),
        id: 0,
      };
      item.webSocket.send(JSON.stringify(turnPlayerResponse));
    });
    if (status === ShotStatus.MISS) {
      this.changePlayer();
    }
  }

  private finishGame() {
    // TODO: delete game room after finish - game should be array
    console.log("Game finished");
    console.log("Update Winners");
  }
}

export default GameService;
