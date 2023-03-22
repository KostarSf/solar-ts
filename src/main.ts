import "./style.css";
import { CosmicBody } from "./engine/CosmicBody";
import { EngineLogic } from "./engine/EngineLogic";

const canvas = document.querySelector<HTMLCanvasElement>("#app")!;
const engine = new EngineLogic(canvas);

for (let y = -1000; y <= 1000; y += 100) {
  for (let x = -1000; x <= 1000; x += 100) {
    engine.scene.addObject(new CosmicBody("white", 10, { x, y }));
  }
}

// engine.scene.addObject(new CosmicBody("white", 10, { x: -50, y: -50 }));
// engine.scene.addObject(new CosmicBody("white", 10, { x: 50, y: -50 }));
// engine.scene.addObject(new CosmicBody("white", 10, { x: 50, y: 50 }));
