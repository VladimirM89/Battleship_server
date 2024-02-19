import { WebSocket } from "ws";
import { OnlinePlayer, PlayerRequest } from "../models/player";

class OnlinePlayers {
  private onlinePlayers: Array<OnlinePlayer>;

  constructor() {
    this.onlinePlayers = [];
  }

  public getAllOnlinePlayers() {
    return this.onlinePlayers;
  }

  public addOnlinePlayer(data: OnlinePlayer) {
    this.onlinePlayers.push(data);
  }

  private findOnlinePlayer(data: OnlinePlayer) {
    return this.onlinePlayers.indexOf(data);
  }

  public deleteOnlinePlayer(data: OnlinePlayer) {
    const index = this.findOnlinePlayer(data);
    this.onlinePlayers.splice(index, 1);
  }

  public addWinToOnlinePlayer(data: OnlinePlayer) {
    const index = this.findOnlinePlayer(data);
    this.onlinePlayers[index].player.wins += 1;
  }

  public findOnlinePlayerByWs(ws: WebSocket): OnlinePlayer | null {
    const result = this.onlinePlayers.find((item) => item.webSocket === ws);
    return result || null;
  }

  public findOnlinePlayerById(id: number): OnlinePlayer | null {
    const result = this.onlinePlayers.find((item) => item.player.index === id);
    return result || null;
  }

  public isPlayerOnline(data: PlayerRequest): boolean {
    const onlinePlayer = this.getAllOnlinePlayers().find((item) => item.player.name === data.name);
    return !!onlinePlayer;
  }
}

export default OnlinePlayers;
