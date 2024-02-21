/* eslint-disable import/no-cycle */
import { playersOnline } from "..";
import { ShipType, ShotStatus, Type } from "../constants/enums/webSocket";
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

class GameService {
  // private game: Game;
  private games: Array<Game>;

  private currentPlayerIndex: number;

  constructor() {
    this.games = [];
    this.currentPlayerIndex = 0;
  }

  private createGame(gameId: number) {
    const game: Game = { gameId, players: [] };
    this.games.push(game);
    return game;
  }

  private findGameById(gameId: number): Game | null {
    const result = this.games.find((item) => item.gameId === gameId);
    return result || null;
  }

  public sendCreateGame(gameId: number) {
    const game = this.findGameById(gameId);

    if (game && game.players.length === 2) {
      game.players.forEach((item) => {
        const createGameResponse: CreateGameResponse = {
          idGame: gameId,
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

  public addPlayerToGame(data: Omit<GamePlayer, "ships">, gameId: number) {
    let game = this.findGameById(gameId);

    if (!game) {
      game = this.createGame(gameId);
    }

    const player = playersOnline.findOnlinePlayerById(data.indexPlayer);

    if (player && game && game.players.length < 2) {
      const playerInGame: GamePlayer = {
        indexPlayer: player.player.index,
        ships: [],
        webSocket: player.webSocket,
      };
      game.players.push(playerInGame);
    }
  }

  public addShipsToPlayers(data: AddShipsRequest) {
    const game = this.findGameById(data.gameId);
    if (game) {
      game.players.forEach((player) => {
        if (player.indexPlayer === data.indexPlayer) {
          player.ships.push(...data.ships);
        }
      });
    }
  }

  public startGame(gameId: number) {
    const game = this.findGameById(gameId);
    if (
      game &&
      game.players.length === 2 &&
      !!game.players[0].ships.length &&
      !!game.players[1].ships.length
    ) {
      game.players.forEach((item) => {
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
      this.changePlayerInGame(gameId);
    }
  }

  private changePlayerInGame(gameId: number) {
    const game = this.findGameById(gameId);
    if (this.currentPlayerIndex === 0) {
      this.currentPlayerIndex = 1;
    } else {
      this.currentPlayerIndex = 0;
    }

    game?.players.forEach((item) => {
      const responseData: PlayerTurnResponse = {
        currentPlayer: game.players[this.currentPlayerIndex].indexPlayer,
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

    const game = this.findGameById(gameId);
    if (game) {
      const gamePlayers = game.players;

      if (indexPlayer !== gamePlayers[this.currentPlayerIndex].indexPlayer) {
        return;
      }

      // const player = gamePlayers.find((item) => item.indexPlayer === indexPlayer);
      const enemy = gamePlayers.find((item) => item.indexPlayer !== indexPlayer);
      let status: keyof typeof ShotStatus = ShotStatus.miss;

      if (enemy) {
        console.log("X=", x, "Y=", y);
        enemy.ships.forEach((ship) => {
          if (x === ship.position.x && y === ship.position.y) {
            if (ship.type === ShipType.small) {
              status = ShotStatus.killed;
            } else {
              status = ShotStatus.shot;
            }
            console.log("SHIP: ", ship);

            this.sendAttackFeedback(game, status, x, y);
          }
        });
        this.changePlayerInGame(gameId);
      }
    }
  }

  public sendAttackFeedback(game: Game, status: keyof typeof ShotStatus, x: number, y: number) {
    game.players.forEach((item) => {
      const responseData: AttackFeedbackResponse = {
        position: { x, y },
        currentPlayer: game.players[this.currentPlayerIndex].indexPlayer,
        status,
      };
      const turnPlayerResponse: commonRequestResponse = {
        type: Type.ATTACK,
        data: JSON.stringify(responseData),
        id: 0,
      };
      item.webSocket.send(JSON.stringify(turnPlayerResponse));
    });
  }

  private finishGame(gameId: number) {
    // TODO: delete game room after finish
    const game = this.findGameById(gameId);
    if (game) {
      const index = this.games.indexOf(game);
      this.games.splice(index, 1);
    }
    console.log("Game finished");
    console.log("Update Winners");
  }
}

export default GameService;