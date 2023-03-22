import { CosmicBody } from "./CosmicBody";
import { Vector } from "./Vector";

export class EngineLogic {
  #pause = false;

  #timerLoop: number;
  #tick = 0;

  #viewport: Viewport;
  #scene = new Scene();

  get scene() { return this.#scene }

  constructor(canvas: HTMLCanvasElement) {
    this.#viewport = new Viewport(canvas, this.#scene);

    this.#timerLoop = setInterval(() => this.tick(), 100);
  }

  private tick(this: EngineLogic) {
    this.#tick += 1;

    if (this.#pause) return;
  }

  public pause(this: EngineLogic, value: boolean) {
    this.#pause = value;
  }
}

class Scene {
  #objects: Drawable[] = [];

  get objects() {
    return this.#objects;
  }

  public addObject(object: Drawable) {
    this.#objects.push(object);
  }
}

export class Drawable {
  draw(vp: Viewport) {}
}

export class Viewport {
  #position = Vector.zero();
  #scale = 1;

  get scale() {
    return this.#scale;
  }
  get position() {
    return Vector.copy(this.#position);
  }

  #width = 0;
  #height = 0;
  #center = Vector.zero();

  #canvas: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D;

  #lastDrawAt = 0;
  #fps = 0;

  #screenCursor = Vector.zero();
  #cursorDelta = Vector.zero();
  #worldCursor = Vector.zero();

  #lmbPressed = false;

  #currentScene: Scene;

  constructor(canvas: HTMLCanvasElement, currentScene: Scene) {
    this.#canvas = canvas;
    this.#ctx = canvas.getContext("2d")!;

    this.updateScreenSizings();
    window.addEventListener("resize", () => this.updateScreenSizings());

    canvas.addEventListener("mousemove", (e) => {
      this.#screenCursor.set(e.clientX, e.clientY);
      this.#cursorDelta.set(e.movementX, e.movementY);
      if (this.#lmbPressed) {
        this.#position.add(Vector.copy(this.#cursorDelta).div(this.#scale));
      }
      console.log(`Delta: ${this.#cursorDelta.toString()}`);

    });

    canvas.addEventListener("mousedown", (e) => {
      e.preventDefault();
      if (e.button === 0) {
        this.#lmbPressed = true;
      }
    });

    canvas.addEventListener("mouseup", (e) => {
      e.preventDefault();
      if (e.button === 0) {
        this.#lmbPressed = false;
      }
    });

    canvas.addEventListener("wheel", (e) => {
      const multiplier = (e.shiftKey ? 0.2 : 0.05) * -Math.sign(e.deltaY);
      this.#scale += this.#scale * multiplier;
      this.#scale = Math.min(Math.max(this.#scale, 0.1), 1000);
    });

    this.#currentScene = currentScene;
    this.requestFrameDraw(0);
  }

  private updateScreenSizings(this: Viewport) {
    this.#width = this.#canvas.width = window.innerWidth;
    this.#height = this.#canvas.height = window.innerHeight;
    this.#center.set(Math.round(this.#width / 2), Math.round(this.#height / 2));
    console.log(`Resize: ${this.#width}x${this.#height}`);
  }

  private requestFrameDraw(this: Viewport, frames: number) {
    this.#fps = Math.round(10000 / (frames - this.#lastDrawAt)) / 10;
    this.#lastDrawAt = frames;

    this.#ctx.clearRect(0, 0, this.#width, this.#height);
    this.drawScene();
    this.drawGUI();

    requestAnimationFrame((frames) => this.requestFrameDraw(frames));
  }

  private drawScene(this: Viewport) {
    if (!this.#ctx) throw new Error("Rendering context is missing!");
    Draw.setContext(this.#ctx);

    for (const object of this.#currentScene.objects) {
      object.draw(this);
    }
  }

  private drawGUI(this: Viewport) {
    Draw.setContext(this.#ctx);
    Draw.guiText(`FPS: ${this.#fps}`, {x: 0, y: 0});
    Draw.guiText(`Screen: ${this.#width}x${this.#height}`, { x: 0, y: 15 });
    Draw.guiText(`Camera pos: ${this.#position.x}:${this.#position.y}`, {
      x: 0,
      y: 30,
    });
    Draw.guiText(`Scale: ${this.#scale}`, { x: 0, y: 45 });
    Draw.guiText(
      `Cursor screen pos: ${this.#screenCursor.x}:${this.#screenCursor.y}`,
      { x: 0, y: 60 }
    );
    Draw.guiText(
      `Cursor delta: ${this.#cursorDelta.x}:${this.#cursorDelta.y}`,
      { x: 0, y: 75 }
    );
  }

  public worldToViewport(position: Vector) {
    return Vector.copy(position)
      .add(this.#position).add(this.#center);
  }
}

export type Position = {
  x: number;
  y: number;
}

export class Draw {
  static #context: CanvasRenderingContext2D;

  static setContext(ctx: CanvasRenderingContext2D) {
    this.#context = ctx;
  }

  static guiText(
    text: string,
    pos: Position,
    color = "white",
    size = 12
  ) {
    const ctx = Draw.#context;

    ctx.fillStyle = color;
    ctx.font = `${size}px sans-serif`;
    ctx.fillText(text, pos.x + 4, pos.y + size);
  }

  static circle(
    pos: Position,
    radius: number,
    fill?: string | CanvasGradient | CanvasPattern | null,
    stroke?: string | CanvasGradient | CanvasPattern | null,
    strokeWidth = 1
  ) {
    const ctx = Draw.#context;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.lineWidth = strokeWidth!;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }
}

const canvas = document.querySelector<HTMLCanvasElement>("#app")!;
const engine = new EngineLogic(canvas);

engine.scene.addObject(new CosmicBody("white", 10));
