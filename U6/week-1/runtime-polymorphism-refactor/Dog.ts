import { Animal } from "./Animal";

export class Dog extends Animal {
  makeSound(): void {
    console.log("Bark!");
  }
}
