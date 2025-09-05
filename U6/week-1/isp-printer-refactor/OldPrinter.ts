import { Printer } from "./Printer";

export class OldPrinter implements Printer {
  print(): void {
    console.log("OldPrinter: Printing document...");
  }
}
