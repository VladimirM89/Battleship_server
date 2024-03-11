import { RANDOM_RANGE } from "../constants/constants";

function generateNumberId(): number {
  const id = Math.floor(Math.random() * RANDOM_RANGE);
  return id;
}

export default generateNumberId;
