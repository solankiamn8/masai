import { Latte } from './Coffee';
import { Caramel, Milk } from './Extras';
import { CustomerDisplay } from './Observer';
import { Order } from './Order';
import { OrderManager } from './OrderManager';
import { CreditCardPayment } from './Payment';
function main(){

    // Step 1: Create a coffee
    let coffee = new Latte();
    coffee = new Milk(coffee)   // add Milk
    coffee = new Caramel(coffee)    // caramel

    console.log(`You ordered: ${coffee.getDesciption()} costing ${coffee.getCost()}`)

    // Step 2: Create order
    let order = new Order(coffee)

    // Step 3: Payment
    order.setPaymentStrategy(new CreditCardPayment())
    order.processPayment()

    // Step 4: Observer (Customer Display)
    order.addObserver(new CustomerDisplay())

    // Step 5: Manage order via singletion
    const manager = OrderManager.getInstance()
    manager.addOrder(order)

    // Step 6: Progress order through states
    order.proceedToNextState()  // Preparing
    order.proceedToNextState()  // Ready -> Notifies Display
    order.proceedToNextState()  //
}

main()