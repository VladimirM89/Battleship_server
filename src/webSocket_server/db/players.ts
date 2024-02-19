/* eslint-disable import/no-cycle */
import { playersOnline } from "..";
import { INCORRECT_PLAYER_PASSWORD_TEXT, PLAYER_ONLINE_TEXT } from "../constants/constants";
import { PlayerInDB, UpdateWinnersResponse } from "../models/player";
import { LoginRequest, LoginResponse } from "../models/registration";
import generateNumberId from "../utils/generateNumberId";

class Players {
  private players: Array<PlayerInDB>;

  constructor() {
    this.players = [];
  }

  public getAllPlayers() {
    return this.players;
  }

  private createPlayer(data: LoginRequest): void {
    this.players.push({ ...data, index: generateNumberId(), wins: 0 });
  }

  private checkIsPasswordCorrect(data: LoginRequest): boolean {
    const result = this.players.find((player) => player.password === data.password);
    return !!result;
  }

  public findPlayer(data: LoginRequest): PlayerInDB | null {
    const result = this.players.find((player) => player.name === data.name);
    return result || null;
  }

  public handlePlayerLogin(data: LoginRequest): LoginResponse {
    const player = this.findPlayer(data);

    if (!player) {
      const newPlayer: PlayerInDB = {
        index: generateNumberId(),
        name: data.name,
        password: data.password,
        wins: 0,
      };
      this.createPlayer(newPlayer);
      const playerResponse: LoginResponse = {
        name: newPlayer.name,
        index: newPlayer.index,
        error: false,
        errorText: "",
      };
      return playerResponse;
    }

    const playerResponse: LoginResponse = {
      name: player.name,
      index: player.index,
      error: false,
      errorText: "",
    };

    if (!this.checkIsPasswordCorrect(data)) {
      return { ...playerResponse, error: true, errorText: INCORRECT_PLAYER_PASSWORD_TEXT };
    }

    if (playersOnline.isPlayerOnline(data)) {
      return { ...playerResponse, error: true, errorText: PLAYER_ONLINE_TEXT };
    }

    return playerResponse;
  }

  public getPlayersWithWins(): Array<UpdateWinnersResponse> {
    const players = this.players.filter((player) => player.wins > 0);
    const result = players.map(({ name, wins }) => {
      return { name, wins };
    });
    return result;
  }
}

export default Players;
