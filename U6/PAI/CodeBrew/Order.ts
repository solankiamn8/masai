import { Observer } from "./Observer";
import { PaymentStrategy } from "./Payment";
import { Coffee } from "./Coffee";

export type OrderState = "Pending" | "Preparing" | "Ready" | "Completed";

export class Order {
  private static idCounter = 1;
  public id: number;
  private coffee: Coffee;
  private paymentStrategy!: PaymentStrategy;
  private state: OrderState = "Pending";
  private observers: Observer[] = [];

  constructor(coffee: Coffee) {
    this.coffee = coffee;
    this.id = Order.idCounter++;
  }

  setPaymentStrategy(strategy: PaymentStrategy){
    this.paymentStrategy = strategy;
  }

  addObserver(observer: Observer){
    this.observers.push(observer)
  }

  notifyObservers(){
    for(const obs of this.observers){
        obs.update(this.id, this.state);
    }
  }

  processPayment(){
    if(!this.paymentStrategy){
        console.log("No payment method set.")
        return;
    }
    this.paymentStrategy.pay(this.coffee.getCost())
  }

  proceedToNextState(){
    if(this.state==="Pending") this.state = "Preparing"
    else if(this.state=="Preparing") this.state = "Ready"
    else if(this.state=="Ready") this.state = "Completed"
    console.log(`Order #${this.id} state:${this.state}`)
    if(this.state == "Ready") this.notifyObservers()
  }

}
