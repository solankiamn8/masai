export interface Observer {
    update(orderId: number, status: string): void;
}

export class CustomerDisplay implements Observer{
    update(orderId: number, status: string): void {
        if(status == "Ready") {
            console.log(`Display: Order #+${orderId} is READY for pickup!`)
        }
    }
}