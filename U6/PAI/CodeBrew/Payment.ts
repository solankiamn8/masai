export interface PaymentStrategy {
  pay(amount: number): void;
}

export class CreditCardPayment implements PaymentStrategy {
  pay(amount: number): void {
    console.log(`Paid ${amount} using Credit Card.`);
  }
}

export class DigitalWalletPayment implements PaymentStrategy {
  pay(amount: number): void {
    console.log(`Paid ${amount} using Digital Wallet.`);
  }
}
