import { Ship } from "../models/room";

function checkShot(ship: Ship, x: number, y: number): boolean {
  if (ship.direction) {
    return (
      ship.position.x === x && y >= ship.position.y && y <= ship.position.y + (ship.length - 1)
    );
  }
  return ship.position.y === y && x >= ship.position.x && x <= ship.position.x + (ship.length - 1);
}

export default checkShot;
