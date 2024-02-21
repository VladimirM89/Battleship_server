/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable import/no-cycle */
import { playersOnline } from "..";
import { ShotStatus, Type } from "../constants/enums/webSocket";
import commonRequestResponse from "../models/commonRequestResponse";
import {
  AttackFeedbackResponse,
  AttackRequest,
  Coordinates,
  CreateGameResponse,
  Game,
  GamePlayer,
  PlayerTurnResponse,
  StartGameResponse,
} from "../models/game";
import { AddShipsRequest, Ship } from "../models/room";
import checkShot from "../utils/checkShot";

class GameService {
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
      game.players.forEach((player) => {
        player.ships.forEach((ship) => (ship.health = ship.length));
      });
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

  private changePlayerInGame(gameId: number, isChange = true) {
    const game = this.findGameById(gameId);
    if (isChange) {
      if (this.currentPlayerIndex === 0) {
        this.currentPlayerIndex = 1;
      } else {
        this.currentPlayerIndex = 0;
      }
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

      if (enemy) {
        // console.log("X=", x, "Y=", y);
        const targetShip = enemy.ships.find((ship) => {
          const isShotInShip = checkShot(ship, x, y);
          console.log("isShotInShip ", isShotInShip);
          return isShotInShip;
        });
        // console.log("a ship that's been shot: ", targetShip);
        if (targetShip) {
          targetShip.health -= 1;
          if (targetShip.health === 0) {
            // this.sendAttackFeedback(game, ShotStatus.killed, x, y);
            this.handleKillShip(game, targetShip);
            this.handleCellAroundKilledShip(game, targetShip);
            this.changePlayerInGame(gameId, false);
          } else {
            this.sendAttackFeedback(game, ShotStatus.shot, { x, y });
            this.changePlayerInGame(gameId, false);
          }
        } else {
          this.sendAttackFeedback(game, ShotStatus.miss, { x, y });
          this.changePlayerInGame(gameId, true);
        }
      }
    }
  }

  public sendAttackFeedback(game: Game, status: keyof typeof ShotStatus, coordinates: Coordinates) {
    const { x, y } = coordinates;
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

  private handleKillShip(game: Game, ship: Ship) {
    const { direction, position, length } = ship;

    // console.log("SHIP: ", ship);

    if (direction) {
      for (let i = position.y; i <= position.y + (length - 1); i += 1) {
        // console.log("DIRECTION: ", direction, "X = ", position.x, "Y = ", i);
        this.sendAttackFeedback(game, ShotStatus.killed, { x: position.x, y: i });
      }
    } else {
      for (let i = position.x; i <= position.x + (length - 1); i += 1) {
        // console.log("DIRECTION: ", direction, "X = ", i, "Y = ", position.y);
        this.sendAttackFeedback(game, ShotStatus.killed, { x: i, y: position.y });
      }
    }
  }

  private handleCellAroundKilledShip(game: Game, ship: Ship) {
    const { direction, position, length } = ship;
    const coordinates: Array<Coordinates> = [];

    if (direction) {
      for (let y = position.y - 1; y <= position.y + length; y += 1) {
        coordinates.push({ x: position.x - 1, y }, { x: position.x + 1, y });
      }
      coordinates.push(
        { x: position.x, y: position.y - 1 },
        { x: position.x, y: position.y + length },
      );
    } else {
      for (let x = position.x - 1; x <= position.x + length; x += 1) {
        coordinates.push({ x, y: position.y - 1 }, { x, y: position.y + 1 });
      }
      coordinates.push(
        { x: position.x - 1, y: position.y },
        { x: position.x + length, y: position.y },
      );
    }

    coordinates.forEach((item) => {
      if (item.x >= 0 && item.x <= 9 && item.y >= 0 && item.y <= 9) {
        this.sendAttackFeedback(game, ShotStatus.miss, item);
      }
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
