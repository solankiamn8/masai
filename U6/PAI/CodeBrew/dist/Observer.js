"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerDisplay = void 0;
class CustomerDisplay {
    update(orderId, status) {
        if (status == "Ready") {
            console.log(`Display: Order #+${orderId} is READY for pickup!`);
        }
    }
}
exports.CustomerDisplay = CustomerDisplay;
