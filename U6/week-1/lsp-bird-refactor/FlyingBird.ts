import { Bird } from "./Bird";

export class FlyingBird extends Bird {
  fly(): void {
    console.log("Flying...");
  }
}
