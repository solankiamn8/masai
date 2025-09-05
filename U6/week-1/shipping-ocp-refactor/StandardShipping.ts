import { Shipping } from "./Shipping";

export class StandardShipping implements Shipping {
  calculate(): number {
    return 50;
  }
}
