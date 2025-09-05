import { Animal } from "./Animal";
import { Dog } from "./Dog";

// Function that demonstrates runtime polymorphism
function makeAnimalSound(animal: Animal) {
  animal.makeSound();
}

const genericAnimal = new Animal();
const dog = new Dog();

makeAnimalSound(genericAnimal); // Output: Some sound
makeAnimalSound(dog);           // Output: Bark! (runtime polymorphism)
