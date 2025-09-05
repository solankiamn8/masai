import { Bird } from "./Bird";

export class Ostrich extends Bird {
  // Ostrich does not have fly(), but can still move
  move(): void {
    console.log("Running...");
  }
}
