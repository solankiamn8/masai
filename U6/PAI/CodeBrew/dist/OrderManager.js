"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderManager = void 0;
class OrderManager {
    constructor() {
        this.orders = [];
    }
    static getInstance() {
        if (!OrderManager.instance) {
            OrderManager.instance = new OrderManager();
        }
        return OrderManager.instance;
    }
    addOrder(order) {
        this.orders.push(order);
        console.log(`Order #${order.id} added.`);
    }
    getOrders() {
        return this.orders;
    }
}
exports.OrderManager = OrderManager;
