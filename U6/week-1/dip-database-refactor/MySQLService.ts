import { Database } from "./Database";

export class MySQLService implements Database {
  save(data: string): void {
    console.log("Saving to MySQL:", data);
  }
}
