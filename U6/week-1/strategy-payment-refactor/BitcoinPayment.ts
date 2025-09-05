import { PaymentStrategy } from "./PaymentStrategy";

export class BitcoinPayment implements PaymentStrategy {
  pay(amount: number): void {
    console.log(`Paid ₿${amount} using Bitcoin`);
  }
}
