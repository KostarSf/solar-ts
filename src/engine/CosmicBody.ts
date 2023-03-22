import { Draw, EngineLogic, GameObject, Position, Scene, Viewport } from "./EngineLogic";
import { Vector } from "./Vector";

export class CosmicBody extends GameObject {
  #name?: string | null;
  #color: string;
  #mass: number;

  #position: Vector;
  #velocity: Vector;

  #static = false;

  get position() {
    return this.#position;
  }

  constructor(
    color: string,
    mass: number,
    position: Position,
    velocity = Vector.zero(),
    name = null
  ) {
    super();

    this.#name = name;
    this.#color = color;
    this.#mass = mass;

    this.#position = Vector.fromPos(position);
    this.#velocity = velocity;
  }

  draw(vp: Viewport): void {
    const viewPos = vp.worldToViewport(this.#position);
    Draw.setAlpha(0.7);
    Draw.circle(viewPos.pos, 2 + (7 + this.#mass / 10) * vp.scale, "white");
    Draw.setAlpha(0.8);
    Draw.circle(viewPos.pos, (7 + this.#mass / 25) * vp.scale, "white");
  }

  tick(engine: EngineLogic): void {
    if (this.#static) return;

    for (const other of engine.scene.objects) {
      if (!CosmicBody.isCosmicBody(other) || other === this) continue;
      const diff = Vector.difference(this.#position, other.#position);
      const distance = Vector.distance(diff);

      const force = (other.#mass / this.#mass / (distance * distance)) * 6.67;

      this.#velocity.add(diff.mult(force).mult(engine.timeScale));

      if (
        this.#mass >= other.#mass &&
        distance < this.#mass * 0.05 &&
        !this.removed &&
        !other.removed
      ) {
        other.removed = true;
        this.#mass += other.#mass;
      }
    }
  }

  tickEnd(engine: EngineLogic): void {
    this.#position.add(Vector.copy(this.#velocity).mult(engine.timeScale));
  }

  static isCosmicBody(object: any): object is CosmicBody {
    return object.constructor === CosmicBody;
  }
}
