"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Coffee_1 = require("./Coffee");
const Extras_1 = require("./Extras");
const Observer_1 = require("./Observer");
const Order_1 = require("./Order");
const OrderManager_1 = require("./OrderManager");
const Payment_1 = require("./Payment");
function main() {
    // Step 1: Create a coffee
    let coffee = new Coffee_1.Latte();
    coffee = new Extras_1.Milk(coffee); // add Milk
    coffee = new Extras_1.Caramel(coffee); // caramel
    console.log(`You ordered: ${coffee.getDesciption()} costing ${coffee.getCost()}`);
    // Step 2: Create order
    let order = new Order_1.Order(coffee);
    // Step 3: Payment
    order.setPaymentStrategy(new Payment_1.CreditCardPayment());
    order.processPayment();
    // Step 4: Observer (Customer Display)
    order.addObserver(new Observer_1.CustomerDisplay());
    // Step 5: Manage order via singletion
    const manager = OrderManager_1.OrderManager.getInstance();
    manager.addOrder(order);
    // Step 6: Progress order through states
    order.proceedToNextState(); // Preparing
    order.proceedToNextState(); // Ready -> Notifies Display
    order.proceedToNextState(); // Completed
}
main();
