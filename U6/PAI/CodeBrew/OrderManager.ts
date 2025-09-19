import { Order } from './Order';
export class OrderManager {
    private static instance: OrderManager;
    private orders: Order[] = [];

    private constructor() {}

    public static getInstance(): OrderManager {
        if(!OrderManager.instance) {
            OrderManager.instance = new OrderManager()
        }
        return OrderManager.instance;
    }

    addOrder(order: Order){
        this.orders.push(order)
        console.log(`Order #${order.id} added.`)
    }

    getOrders(): Order[] {
        return this.orders;
    }
}