import { Coffee } from "./Coffee";
export abstract class CoffeeDecorator implements Coffee {
  protected coffee: Coffee;
  constructor(coffee: Coffee) {
    this.coffee = coffee;
  }
  abstract getCost(): number;
  abstract getDesciption(): string;
}

export class Milk extends CoffeeDecorator {
  getCost(): number {
    return this.coffee.getCost() + 10;
  }
  getDesciption(): string {
    return this.coffee.getDesciption() + ", Milk";
  }
}

export class Caramel extends CoffeeDecorator {
  getCost(): number {
    return this.coffee.getCost() + 20;
  }
  getDesciption(): string {
    return this.coffee.getDesciption() + ", Caramel";
  }
}
