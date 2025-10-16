"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Latte = exports.Espresso = void 0;
class Espresso {
    getCost() {
        return 50;
    }
    getDesciption() {
        return "Espresso";
    }
}
exports.Espresso = Espresso;
class Latte {
    getCost() {
        return 70;
    }
    getDesciption() {
        return "Latte";
    }
}
exports.Latte = Latte;
