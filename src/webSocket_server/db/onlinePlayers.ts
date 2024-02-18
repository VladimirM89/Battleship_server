import { OnlinePlayer } from "../models/player";

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
}

export default OnlinePlayers;
