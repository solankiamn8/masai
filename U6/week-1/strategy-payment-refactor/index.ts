import { CardPayment } from "./CardPayment";
import { UpiPayment } from "./UpiPayment";
import { BitcoinPayment } from "./BitcoinPayment";
import { Payment } from "./Payment";

const payment = new Payment(new CardPayment());
payment.process(1000); // Paid ₹1000 using Card

payment.setStrategy(new UpiPayment());
payment.process(500); // Paid ₹500 using UPI

payment.setStrategy(new BitcoinPayment());
payment.process(2000); // Paid ₿2000 using Bitcoin
