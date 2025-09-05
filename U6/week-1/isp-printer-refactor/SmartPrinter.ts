import { Printer } from "./Printer";
import { Scanner } from "./Scanner";
import { Fax } from "./Fax";

export class SmartPrinter implements Printer, Scanner, Fax {
  print(): void {
    console.log("SmartPrinter: Printing document...");
  }

  scan(): void {
    console.log("SmartPrinter: Scanning document...");
  }

  fax(): void {
    console.log("SmartPrinter: Sending fax...");
  }
}
