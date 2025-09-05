import { MallardDuck } from "./Q1_Duck";
import { Bird, Penguin } from "./Q2_Bird";
import { ToyDuck } from "./Q3_IDuck";

// Q1
console.log("Q1 Output:");
const mallard = new MallardDuck();
mallard.swim(); // I know swimming

// Q2
console.log("\nQ2 Output:");
const bird = new Bird();
const penguin = new Penguin();
bird.fly();     // I can fly
penguin.fly();  // I cannot fly

// Q3
console.log("\nQ3 Output:");
const toyDuck = new ToyDuck();
toyDuck.fly();   // Cannot fly
toyDuck.sound(); // Cannot sound
toyDuck.swim();  // Can float on water
