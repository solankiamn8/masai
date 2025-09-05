import { Shipping } from "./Shipping";
import { StandardShipping } from "./StandardShipping";
import { ExpressShipping } from "./ExpressShipping";

function calculateShipping(shipping: Shipping) {
  console.log(`Shipping cost: ${shipping.calculate()}`);
}

const standard = new StandardShipping();
const express = new ExpressShipping();

calculateShipping(standard); // Shipping cost: 50
calculateShipping(express);  // Shipping cost: 100
