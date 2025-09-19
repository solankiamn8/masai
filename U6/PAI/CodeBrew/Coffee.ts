export interface Coffee {
  getCost(): number;
  getDesciption(): string;
}

export class Espresso implements Coffee {
  getCost(): number {
    return 50;
  }
  getDesciption(): string {
    return "Espresso";
  }
}

export class Latte implements Coffee {
  getCost(): number {
    return 70;
  }
  getDesciption(): string {
    return "Latte";
  }
}
