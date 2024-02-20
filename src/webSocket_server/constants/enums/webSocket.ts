export enum Type {
  REG = "reg",
  UPDATE_WINNERS = "update_winners",
  CREATE_ROOM = "create_room",
  ADD_USER_TO_ROOM = "add_user_to_room",
  CREATE_GAME = "create_game",
  UPDATE_ROOM = "update_room",
  ADD_SHIPS = "add_ships",
  START_GAME = "start_game",
  ATTACK = "attack",
  RANDOM_ATTACK = "randomAttack",
  TURN = "turn",
  FINISH = "finish",
}

export enum ShipType {
  small = "small",
  medium = "medium",
  large = "large",
  huge = "huge",
}

export enum ShotStatus {
  miss = "miss",
  killed = "killed",
  shot = "shot",
}
