"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
class Order {
    constructor(coffee) {
        this.state = "Pending";
        this.observers = [];
        this.coffee = coffee;
        this.id = Order.idCounter++;
    }
    setPaymentStrategy(strategy) {
        this.paymentStrategy = strategy;
    }
    addObserver(observer) {
        this.observers.push(observer);
    }
    notifyObservers() {
        for (const obs of this.observers) {
            obs.update(this.id, this.state);
        }
    }
    processPayment() {
        if (!this.paymentStrategy) {
            console.log("No payment method set.");
            return;
        }
        this.paymentStrategy.pay(this.coffee.getCost());
    }
    proceedToNextState() {
        if (this.state === "Pending")
            this.state = "Preparing";
        else if (this.state == "Preparing")
            this.state = "Ready";
        else if (this.state == "Ready")
            this.state = "Completed";
        console.log(`Order #${this.id} state:${this.state}`);
        if (this.state == "Ready")
            this.notifyObservers();
    }
}
exports.Order = Order;
Order.idCounter = 1;
