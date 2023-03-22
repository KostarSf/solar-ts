import { Position } from "./EngineLogic";

export class Vector {
  x: number;
  y: number;

  get pos(): Position {
    return { x: this.x, y: this.y };
  }

  constructor(x: number, y?: number) {
    this.x = x;
    this.y = typeof y === 'number' ? y : x;
  }

  static zero = () => new Vector(0, 0);

  static fromPos(position: Position) {
    return new Vector(position.x, position.y);
  }

  static copy(vector: Vector) {
    return new Vector(vector.x, vector.y);
  }

  static difference(vec1: Vector, vec2: Vector) {
    return new Vector(vec2.x - vec1.x, vec2.y - vec1.y);
  }

  static distance(difference: Vector) {
    return Math.hypot(difference.x, difference.y);
  }

  toString() {
    return `{ x: ${this.x}, y: ${this.y} }`;
  }

  set(x: number | Vector, y?: number) {
    const values = getFuncValues(x, y);
    if (values) {
      this.x = values.x;
      this.y = values.y;
    }
    return this;
  }

  add(x: number | Vector, y?: number) {
    const values = getFuncValues(x, y);
    if (values) {
      this.x += values.x;
      this.y += values.y;
    }
    return this;
  }

  sub(x: number | Vector, y?: number) {
    const values = getFuncValues(x, y);
    if (values) {
      this.x -= values.x;
      this.y -= values.y;
    }
    return this;
  }

  mult(x: number | Vector, y?: number) {
    const values = getFuncValues(x, y);
    if (values) {
      this.x *= values.x;
      this.y *= values.y;
    }
    return this;
  }

  div(x: number | Vector, y?: number) {
    const values = getFuncValues(x, y);
    if (values) {
      this.x /= values.x;
      this.y /= values.y;
    }
    return this;
  }
}

function getFuncValues(x: number | Vector, y?: number) {
  if (isVector(x)) {
    return Vector.copy(x);
  } else {
    return new Vector(x, y);
  }
}

function isVector(val: any): val is Vector {
  return typeof val === 'object' && typeof val.x === "number" && typeof val.y === "number";
}
