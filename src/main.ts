import "./style.css";

const canvas = document.querySelector<HTMLCanvasElement>("#app")!;
const ctx = canvas.getContext("2d")!;

let screenCenter = {
  x: 0,
  y: 0,
};

window.addEventListener("resize", resizeCanvas, false);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  screenCenter = {
    x: Math.round(canvas.width / 2),
    y: Math.round(canvas.height / 2),
  };
}

resizeCanvas();

let timer = 0;
let camera = {
  x: 0,
  y: 0,
};
let scale = 1;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCircle(0, 0, 20, "yellow");
  drawCircle(Math.sin(timer / 15) * 50, Math.cos(timer / 15) * 50, 5, "white");

  drawCircle(150, 150, 10, "white");

  drawCircle(100, -100, 10, "white");

  drawCircle(120, -50, 10, "white");

  drawCircle(-50, 200, 10, "white");

  drawText(`Time: ${timer}`, 5, 10);
  drawText(`Camera: ${camera.x} ${camera.y}`, 5, 20);
  drawText(`Mouse: ${lmbDown}`, 5, 30);
  drawText(`Scale: ${scale}`, 5, 40);
  drawRect(screenCenter.x - 4, screenCenter.y, 9, 1, 'green');
  drawRect(screenCenter.x, screenCenter.y - 4, 1, 9, "green");
}

const logicTimer = setInterval(() => {
  timer += 1;
  scale = clamp(scale, 0.1, 1000);
  draw();
}, 16);

let lmbDown = false;

window.addEventListener("mousedown", (e) => {
  if (e.button === 0) lmbDown = true;
});
window.addEventListener("mouseup", () => (lmbDown = false));
window.addEventListener("mousemove", (e) => {
  const delta = { x: e.movementX, y: e.movementY };
  if (lmbDown) {
    camera.x += delta.x / scale;
    camera.y += delta.y / scale;
  }
});
window.addEventListener("wheel", (e) => {
  const multiplier = e.shiftKey ? 0.2 : 0.05;
  scale += scale * multiplier * -Math.sign(e.deltaY);
});
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
  strokeWidth = 0
) {
  ctx.beginPath();
  ctx.arc(
    screenCenter.x + (x + camera.x) * scale,
    screenCenter.y + (y + camera.y) * scale,
    radius * scale,
    0,
    2 * Math.PI,
    false
  );
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
