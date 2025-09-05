import { OldPrinter } from "./OldPrinter";
import { SmartPrinter } from "./SmartPrinter";

const oldPrinter = new OldPrinter();
oldPrinter.print();

const smartPrinter = new SmartPrinter();
smartPrinter.print();
smartPrinter.scan();
smartPrinter.fax();
