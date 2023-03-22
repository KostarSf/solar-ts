import { Position } from "./EngineLogic";

export class Vector {
  x: number;
  y: number;

  get pos(): Position {
    return { x: this.x, y: this.y };
  }

  constructor(x: number, y?: number) {
    this.x = x;
    this.y = y ? y : x;
  }

  static zero = () => new Vector(0, 0);

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

function getFuncValues(x: any, y?: any) {
  if (isVector(x)) {
    return Vector.copy(x);
  } else if (typeof x === "number" && (!y || typeof y === "number")) {
    return new Vector(x, y ? y : x);
  }
  return null;
}

function isVector(val: any): val is Vector {
  return val && typeof val.x === "number" && typeof val.y === "number";
}
