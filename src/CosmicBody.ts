import { Draw, Drawable, Viewport } from "./EngineLogic";
import { Vector } from "./Vector";

export class CosmicBody extends Drawable {
  #name?: string | null;
  #color: string;
  #mass: number;

  #position: Vector;
  #velocity: Vector;

  constructor(
    color: string,
    mass: number,
    position = Vector.zero(),
    velocity = Vector.zero(),
    name = null
  ) {
    super();

    this.#name = name;
    this.#color = color;
    this.#mass = mass;

    this.#position = position;
    this.#velocity = velocity;
  }

  draw(vp: Viewport): void {
    const viewPos = vp.worldToViewport(this.#position);
    Draw.circle(viewPos.pos, 10 * vp.scale, 'white');
  }
}
