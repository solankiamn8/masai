export class Bird {
    fly(): void {
      console.log("I can fly");
    }
  }
  
  export class Penguin extends Bird {
    fly(): void {
      console.log("I cannot fly");
    }
  }
  