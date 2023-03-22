import { Vector } from "./Vector";

export class CosmicBody {
  name?: string | null;
  color: string;
  mass: number;

  position: Vector;
  velocity: Vector;

  constructor(
    color: string,
    mass: number,
    position = Vector.zero(),
    velocity = Vector.zero(),
    name = null
  ) {
    this.name = name;
    this.color = color;
    this.mass = mass;

    this.position = position;
    this.velocity = velocity;
  }
}
