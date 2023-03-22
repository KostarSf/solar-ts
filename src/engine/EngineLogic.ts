import { Vector } from "./Vector";

export class EngineLogic {
  #pause = false;

  #timerLoop: number;
  #timer = 0;

  #viewport: Viewport;
  #scene = new Scene();

  #timeScale = 1;

  get timer() {
    return this.#timer;
  }

  get timeScale() {
    return this.#timeScale;
  }

  get scene() {
    return this.#scene;
  }

  constructor(canvas: HTMLCanvasElement) {
    this.#viewport = new Viewport(canvas, this);
    this.#timerLoop = setInterval(() => this.tick(), 15);

    console.log(this.constructor === Array);

    document.querySelector("#btn-pause")!.addEventListener("click", () => {
      this.#pause = !this.#pause;
    });

    const timeInput = document.querySelector<HTMLInputElement>("#time-range")!;
    timeInput.value = String(this.#timeScale);
    const that = this;
    timeInput.addEventListener('input', function() {
      that.#timeScale = Number(this.value);
    })
  }

  private tick(this: EngineLogic) {
    if (this.#pause) return;
    this.#timer += 1;

    for (const object of this.#scene.objects) {
      object.tick(this);
    }

    for (const object of this.#scene.objects) {
      object.tickEnd(this);
    }

    this.#scene.removeMarkedObjects();
  }

  public setPause(this: EngineLogic, value: boolean) {
    this.#pause = value;
  }
}

export class Scene {
  #objects: GameObject[] = [];

  get objects() {
    return this.#objects;
  }

  public addObject(object: GameObject) {
    this.#objects.push(object);
  }

  public removeMarkedObjects() {
    this.#objects = this.#objects.filter((o) => !o.removed);
  }
}

export class GameObject {
  removed = false;
  draw(vp: Viewport) {}
  tick(engine: EngineLogic) {}
  tickEnd(engine: EngineLogic) {}
}

export class Viewport {
  #position = Vector.zero();
  #scale = 0.2;

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
  #engine: EngineLogic;

  constructor(canvas: HTMLCanvasElement, engine: EngineLogic) {
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

    this.#currentScene = engine.scene;
    this.#engine = engine;
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
    Draw.guiText(`FPS: ${this.#fps}`, { x: 0, y: 0 });
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
    Draw.guiText(
      `Objects: ${this.#currentScene.objects.length}`,
      { x: 0, y: 90 }
    );
    Draw.guiText(`Time scale: ${this.#engine.timeScale}`, {
      x: 0,
      y: 105,
    });
  }

  public worldToViewport(position: Vector) {
    return Vector.copy(this.#center).add(
      Vector.copy(position).add(this.#position).mult(this.#scale)
    );
  }
}

export type Position = {
  x: number;
  y: number;
};

export class Draw {
  static #context: CanvasRenderingContext2D;

  static setContext(ctx: CanvasRenderingContext2D) {
    this.#context = ctx;
  }

  static guiText(text: string, pos: Position, color = "white", size = 12) {
    const ctx = Draw.#context;

    ctx.fillStyle = color;
    ctx.font = `${size}px sans-serif`;
    ctx.fillText(text, pos.x + 4, pos.y + size);
  }

  static setAlpha(amount: number) {
    this.#context.globalAlpha = amount;
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
