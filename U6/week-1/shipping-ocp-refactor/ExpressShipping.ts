import { Shipping } from "./Shipping";

export class ExpressShipping implements Shipping {
  calculate(): number {
    return 100;
  }
}
