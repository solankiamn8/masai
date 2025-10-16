"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigitalWalletPayment = exports.CreditCardPayment = void 0;
class CreditCardPayment {
    pay(amount) {
        console.log(`Paid ${amount} using Credit Card.`);
    }
}
exports.CreditCardPayment = CreditCardPayment;
class DigitalWalletPayment {
    pay(amount) {
        console.log(`Paid ${amount} using Digital Wallet.`);
    }
}
exports.DigitalWalletPayment = DigitalWalletPayment;
