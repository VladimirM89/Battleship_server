import { Ship } from "../../models/room";
import { ShipType } from "./webSocket";

const ships: Array<Array<Ship>> = [
  [
    { position: { x: 5, y: 3 }, direction: true, type: ShipType.huge, length: 4, health: 4 },
    { position: { x: 0, y: 6 }, direction: false, type: ShipType.large, length: 3, health: 3 },
    { position: { x: 7, y: 6 }, direction: false, type: ShipType.large, length: 3, health: 3 },
    { position: { x: 3, y: 1 }, direction: true, type: ShipType.medium, length: 2, health: 2 },
    { position: { x: 4, y: 8 }, direction: true, type: ShipType.medium, length: 2, health: 2 },
    { position: { x: 6, y: 0 }, direction: true, type: ShipType.medium, length: 2, health: 2 },
    { position: { x: 8, y: 0 }, direction: true, type: ShipType.small, length: 1, health: 1 },
    { position: { x: 1, y: 8 }, direction: false, type: ShipType.small, length: 1, health: 1 },
    { position: { x: 1, y: 0 }, direction: true, type: ShipType.small, length: 1, health: 1 },
    { position: { x: 6, y: 8 }, direction: true, type: ShipType.small, length: 1, health: 1 },
  ],
  [
    { position: { x: 4, y: 2 }, direction: false, type: "huge", length: 4, health: 4 },
    { position: { x: 9, y: 4 }, direction: true, type: "large", length: 3, health: 3 },
    { position: { x: 0, y: 2 }, direction: false, type: "large", length: 3, health: 3 },
    { position: { x: 5, y: 7 }, direction: true, type: "medium", length: 2, health: 2 },
    { position: { x: 0, y: 6 }, direction: false, type: "medium", length: 2, health: 2 },
    { position: { x: 0, y: 8 }, direction: true, type: "medium", length: 2, health: 2 },
    { position: { x: 4, y: 0 }, direction: true, type: "small", length: 1, health: 1 },
    { position: { x: 8, y: 0 }, direction: true, type: "small", length: 1, health: 1 },
    { position: { x: 3, y: 5 }, direction: true, type: "small", length: 1, health: 1 },
    { position: { x: 2, y: 9 }, direction: false, type: "small", length: 1, health: 1 },
  ],
  [
    { position: { x: 0, y: 7 }, direction: false, type: ShipType.huge, length: 4, health: 4 },
    { position: { x: 7, y: 3 }, direction: true, type: ShipType.large, length: 3, health: 3 },
    { position: { x: 1, y: 1 }, direction: true, type: ShipType.large, length: 3, health: 3 },
    { position: { x: 3, y: 3 }, direction: false, type: ShipType.medium, length: 2, health: 2 },
    { position: { x: 7, y: 0 }, direction: true, type: ShipType.medium, length: 2, health: 2 },
    { position: { x: 1, y: 9 }, direction: false, type: ShipType.medium, length: 2, health: 2 },
    { position: { x: 8, y: 7 }, direction: false, type: ShipType.small, length: 1, health: 1 },
    { position: { x: 3, y: 1 }, direction: false, type: ShipType.small, length: 1, health: 1 },
    { position: { x: 4, y: 5 }, direction: true, type: ShipType.small, length: 1, health: 1 },
    { position: { x: 5, y: 9 }, direction: false, type: ShipType.small, length: 1, health: 1 },
  ],
  [
    { position: { x: 7, y: 0 }, direction: true, type: ShipType.huge, length: 4, health: 4 },
    { position: { x: 2, y: 1 }, direction: false, type: ShipType.large, length: 3, health: 3 },
    { position: { x: 1, y: 5 }, direction: true, type: ShipType.large, length: 3, health: 3 },
    { position: { x: 5, y: 4 }, direction: true, type: ShipType.medium, length: 2, health: 2 },
    { position: { x: 7, y: 6 }, direction: false, type: ShipType.medium, length: 2, health: 2 },
    { position: { x: 9, y: 1 }, direction: true, type: ShipType.medium, length: 2, health: 2 },
    { position: { x: 3, y: 3 }, direction: true, type: ShipType.small, length: 1, health: 1 },
    { position: { x: 3, y: 5 }, direction: true, type: ShipType.small, length: 1, health: 1 },
    { position: { x: 9, y: 4 }, direction: true, type: ShipType.small, length: 1, health: 1 },
    { position: { x: 3, y: 7 }, direction: false, type: ShipType.small, length: 1, health: 1 },
  ],
];

export default ships;
