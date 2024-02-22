/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
import { ShotStatus, Type } from "../constants/enums/webSocket";
import playersOnline from "../db/playersOnline";
import commonRequestResponse from "../models/commonRequestResponse";
import {
  AttackFeedbackResponse,
  AttackRequest,
  Coordinates,
  CreateGameResponse,
  FinishResponse,
  Game,
  GamePlayer,
  PlayerTurnResponse,
  RandomAttackRequest,
  StartGameResponse,
} from "../models/game";
import { AddShipsRequest, Ship } from "../models/room";
import checkShot from "../utils/checkShot";
import { sendToAll } from "../utils/sendResponse";

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
        shots: [],
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

      const enemy = gamePlayers.find((item) => item.indexPlayer !== indexPlayer);

      if (enemy) {
        const targetShip = enemy.ships.find((ship) => {
          const isShotInShip = checkShot(ship, x, y);
          return isShotInShip;
        });
        if (targetShip) {
          targetShip.health -= 1;
          if (targetShip.health === 0) {
            this.handleKillShip(game, targetShip);
            this.handleCellAroundKilledShip(game, targetShip);
            this.finishGame(game);
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

    if (!this.isShotExist(game, coordinates)) {
      // console.log("COORDINATES: ", coordinates);
      game.players[this.currentPlayerIndex].shots?.push(coordinates);
      // console.log("ARRAY OF SHOTS: ", game.players[this.currentPlayerIndex].shots);
      // console.log("ARRAY LENGTH OF SHOTS: ", game.players[this.currentPlayerIndex].shots?.length);
    }

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

    if (direction) {
      for (let i = position.y; i <= position.y + (length - 1); i += 1) {
        this.sendAttackFeedback(game, ShotStatus.killed, { x: position.x, y: i });
      }
    } else {
      for (let i = position.x; i <= position.x + (length - 1); i += 1) {
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
        const isShotExist = this.isShotExist(game, { x: item.x, y: item.y });
        if (!isShotExist) {
          this.sendAttackFeedback(game, ShotStatus.miss, item);
        }
      }
    });
  }

  private isShotExist(game: Game, coordinates: Coordinates): boolean {
    const { shots } = game.players[this.currentPlayerIndex];
    const result = shots?.find((item) => item.x === coordinates.x && item.y === coordinates.y);
    return !!result;
  }

  public handleRandomAttack(request: RandomAttackRequest) {
    const { gameId, indexPlayer } = request;
    const game = this.games.find((item) => item.gameId === gameId);
    const player = game?.players.find((item) => item.indexPlayer === indexPlayer);
    const shotCoordinates = this.randomShot(player!.shots!);
    this.receiveAttack({ gameId, indexPlayer, x: shotCoordinates.x, y: shotCoordinates.y });
  }

  private randomShot(shots: Array<Coordinates>): Coordinates {
    const randomX = Math.floor(Math.random() * 10);
    const randomY = Math.floor(Math.random() * 10);
    const isShotExist = shots.find((item) => item.x === randomX && item.y === randomY);

    if (!isShotExist) {
      return { x: randomX, y: randomY };
    }
    return this.randomShot(shots);
  }

  private finishGame(game: Game) {
    const looser = game.players.find((item) => item.ships.every((ship) => ship.health === 0));

    if (looser) {
      const winner = game.players.find((item) => item.indexPlayer !== looser.indexPlayer);

      const finishResponse: FinishResponse = {
        winPlayer: winner!.indexPlayer,
      };

      sendToAll({ type: Type.FINISH, data: JSON.stringify(finishResponse), id: 0 });
      // TODO: increase number of player's win, update player
      const index = this.games.indexOf(game);
      this.games.splice(index, 1);
    }
  }
}

export default GameService;
