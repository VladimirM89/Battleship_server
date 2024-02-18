/* eslint-disable import/no-cycle */
/* eslint-disable class-methods-use-this */
import { playersOnline } from "..";
import { INCORRECT_PLAYER_PASSWORD_TEXT, PLAYER_ONLINE_TEXT } from "../constants/constants";
import { PlayerInDB, PlayerRequest, PlayerResponse } from "../models/player";
import generateNumberId from "../utils/generateNumberId";

class Players {
  private players: Array<PlayerInDB>;

  constructor() {
    this.players = [];
  }

  public getAllPlayers() {
    return this.players;
  }

  private createPlayer(data: PlayerRequest): void {
    this.players.push({ ...data, index: generateNumberId(), wins: 0 });
  }

  private checkIsPasswordCorrect(data: PlayerRequest): boolean {
    const result = this.players.find((player) => player.password === data.password);
    return !!result;
  }

  public findPlayer(data: PlayerRequest): PlayerInDB | null {
    const result = this.players.find((player) => player.name === data.name);
    return result || null;
  }

  private isPlayerOnline(data: PlayerRequest): boolean {
    const onlinePlayer = playersOnline
      .getAllOnlinePlayers()
      .find((item) => item.player.name === data.name);
    return !!onlinePlayer;
  }

  public handlePlayerLogin(data: PlayerRequest): PlayerResponse {
    const player = this.findPlayer(data);

    if (!player) {
      const newPlayer: PlayerInDB = {
        index: generateNumberId(),
        name: data.name,
        password: data.password,
        wins: 0,
      };
      this.createPlayer(newPlayer);
      const playerResponse: PlayerResponse = {
        name: newPlayer.name,
        index: newPlayer.index,
        error: false,
        errorText: "",
      };
      return playerResponse;
    }

    const playerResponse: PlayerResponse = {
      name: player.name,
      index: player.index,
      error: false,
      errorText: "",
    };

    if (!this.checkIsPasswordCorrect(data)) {
      return { ...playerResponse, error: true, errorText: INCORRECT_PLAYER_PASSWORD_TEXT };
    }

    if (this.isPlayerOnline(data)) {
      return { ...playerResponse, error: true, errorText: PLAYER_ONLINE_TEXT };
    }

    return playerResponse;
  }
}

export default Players;
