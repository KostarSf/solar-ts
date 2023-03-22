import { CosmicBody } from "./OldCosmicBody";
import "./style.css";

const canvas = document.querySelector<HTMLCanvasElement>("#app")!;


import { Vector } from "./Vector";

const ctx = canvas.getContext("2d")!;

let screenCenter = Vector.zero();

window.addEventListener("resize", resizeCanvas, false);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  screenCenter.set(Math.round(canvas.width / 2), Math.round(canvas.height / 2));
}

resizeCanvas();

let timer = 0;
let camera = Vector.zero();
let scale = 1;
let timeScale = 1;
let showVelocity = false;

const bodies: CosmicBody[] = [
  {
    color: "white",
    mass: 1,
    position: new Vector(30),
    velocity: new Vector(1, -1),
  },
  {
    color: "white",
    mass: 1,
    position: new Vector(-30),
    velocity: new Vector(-1, 1),
  },
  // {
  //   color: "green",
  //   mass: 1,
  //   position: new Vector(0),
  //   velocity: new Vector(0, 0.01),
  // },
];

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const body of bodies) {
    const pos = body.position;
    const vel = body.velocity;
    for (const other of bodies.filter((b) => b !== body)) {
      const diffX = other.position.x - pos.x;
      const diffY = other.position.y - pos.y;

      const distance = Math.hypot(diffX, diffY);
      // const massDiff = other.mass / body.mass;

      // vel.x += (diffX / distance) * massDiff * timeScale;
      // vel.y += (diffY / distance) * massDiff * timeScale;

      const force = (other.mass / body.mass / (distance * distance)) * 6.67;
      vel.x += diffX * force * timeScale;
      vel.y += diffY * force * timeScale;
    }
  }

  for (const body of bodies) {
    const pos = body.position;
    const vel = body.velocity;

    let stroke: string | null = null;
    if (choosedBody === body) {
      stroke = "red";
    }

    ctx.globalAlpha = 0.2;
    drawCircle(
      pos.x,
      pos.y,
      15 + body.mass * 1.5 * Math.sign(body.mass),
      body.color
    );
    ctx.globalAlpha = 1.0;
    drawCircle(
      pos.x,
      pos.y,
      10 + body.mass * Math.sign(body.mass),
      body.color,
      stroke,
      2
    );
    showVelocity && drawLine(pos.x, pos.y, pos.x + vel.x * 3, pos.y + vel.y * 3);

    pos.x += vel.x * timeScale;
    pos.y += vel.y * timeScale;
  }

  if (rmbDown) {
    drawCircle(rmbPoint.x, rmbPoint.y, 5, "green");
    drawLine(rmbPoint.x, rmbPoint.y, mousePos.x, mousePos.y, "yellow");
  }

  drawCircle(mousePos.x, mousePos.y, 5, "green");

  // drawCircle(0, 0, 20, "yellow");
  // drawCircle(Math.sin(timer / 15) * 50, Math.cos(timer / 15) * 50, 5, "white");

  // drawCircle(150, 150, 10, "white");

  // drawCircle(100, -100, 10, "white");

  // drawCircle(120, -50, 10, "white");

  // drawCircle(-50, 200, 10, "white");

  drawText(`Time: ${timer}`, 5, 10);
  drawText(`Camera: ${camera.x} ${camera.y}`, 5, 20);
  drawText(`Mouse: ${lmbDown}`, 5, 30);
  drawText(`Scale: ${scale}`, 5, 40);
  drawText(`Time: ${timeScale}`, 5, 50);
  drawRect(screenCenter.x - 4, screenCenter.y, 9, 1, "green");
  drawRect(screenCenter.x, screenCenter.y - 4, 1, 9, "green");
}

setInterval(() => {
  timer += 1;
  scale = clamp(scale, 0.1, 1000);
  mousePos = cursorToCoords(cursorClientPos);
  draw();
}, 16);

let lmbDown = false;
let rmbDown = false;
let rmbPoint = Vector.zero();
let mousePos = Vector.zero();

let cursorClientPos = Vector.zero();

let choosedBody: CosmicBody | null = null;

canvas.addEventListener("mousedown", (e) => {
  e.preventDefault();
  if (e.button === 0) lmbDown = true;
  if (e.button === 2) {
    rmbDown = true;
    rmbPoint = cursorToCoords(new Vector(e.clientX, e.clientY));
  }
  if (e.button === 1) {
    const previouslyChoosed = choosedBody;
    choosedBody = null;
    for (const body of bodies) {
      const diffX = body.position.x - mousePos.x;
      const diffY = body.position.y - mousePos.y;

      const dist = 10 + body.mass;

      if (Math.abs(diffX) < dist && Math.abs(diffY) < dist) {
        choosedBody = body;
      }
    }
    if (!choosedBody && previouslyChoosed) {
      camera.x = -previouslyChoosed.position.x;
      camera.y = -previouslyChoosed.position.y;
    }
  }
});
canvas.addEventListener("mouseup", (e) => {
  if (e.button === 0) lmbDown = false;
  if (e.button === 2) {
    rmbDown = false;
    const newBody: CosmicBody = {
      name: '',
      color: "white",
      mass: 1,
      position: Vector.copy(rmbPoint),
      velocity: Vector.copy(rmbPoint).sub(mousePos).div(10),
    };
    bodies.push(newBody);
  }
});
canvas.addEventListener("mousemove", (e) => {
  cursorClientPos.set(e.clientX, e.clientY);
  const delta = new Vector(e.movementX, e.movementY);
  if (lmbDown) {
    camera.add(Vector.copy(delta.div(scale)));
  }
});
canvas.addEventListener("wheel", (e) => {
  const multiplier = e.shiftKey ? 0.2 : 0.05;
  scale += scale * multiplier * -Math.sign(e.deltaY);
});
const timeRangeInput = document.querySelector<HTMLInputElement>("#time-range")!;
timeRangeInput.value = String(timeScale);
timeRangeInput.addEventListener("input", function () {
  timeScale = Number(this.value);
});

function cursorToCoords(cursorPos: Vector): Vector {
  const offset = choosedBody
    ? Vector.difference(
        choosedBody.velocity,
        Vector.copy(choosedBody.position).mult(-1)
      )
    : camera;
  return Vector.copy(cursorPos).sub(screenCenter).div(scale).sub(offset);
}

function drawText(text: string, x: number, y: number, color = "white") {
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

function drawRect(
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string | CanvasGradient | CanvasPattern
) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, width, height);
}

function drawCircle(
  x: number,
  y: number,
  radius: number,
  fill?: string | CanvasGradient | CanvasPattern | null,
  stroke?: string | CanvasGradient | CanvasPattern | null,
  strokeWidth = 1
) {
  ctx.beginPath();
  ctx.arc(visualX(x), visualY(y), radius * scale, 0, 2 * Math.PI, false);
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

function visualX(x: number) {
  const offsetX = choosedBody ? -choosedBody.position.x : camera.x;
  return screenCenter.x + (x + offsetX) * scale;
}
function visualY(y: number) {
  const offsetY = choosedBody ? -choosedBody.position.y : camera.y;
  return screenCenter.y + (y + offsetY) * scale;
}

function drawLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color = "blue"
) {
  ctx.beginPath();
  ctx.moveTo(visualX(x1), visualY(y1));
  ctx.lineTo(visualX(x2), visualY(y2));
  ctx.strokeStyle = color;
  ctx.stroke();
}
