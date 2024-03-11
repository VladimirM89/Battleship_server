import ships from "../constants/enums/ships";
import { Ship } from "../models/room";

function generateShips(): Array<Ship> {
  const presentsNumber = ships.length;
  const random = Math.floor(Math.random() * (presentsNumber - 1));
  return ships[random];
}

export default generateShips;
