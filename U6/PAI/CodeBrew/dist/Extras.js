"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Caramel = exports.Milk = exports.CoffeeDecorator = void 0;
class CoffeeDecorator {
    constructor(coffee) {
        this.coffee = coffee;
    }
}
exports.CoffeeDecorator = CoffeeDecorator;
class Milk extends CoffeeDecorator {
    getCost() {
        return this.coffee.getCost() + 10;
    }
    getDesciption() {
        return this.coffee.getDesciption() + ", Milk";
    }
}
exports.Milk = Milk;
class Caramel extends CoffeeDecorator {
    getCost() {
        return this.coffee.getCost() + 20;
    }
    getDesciption() {
        return this.coffee.getDesciption() + ", Caramel";
    }
}
exports.Caramel = Caramel;
