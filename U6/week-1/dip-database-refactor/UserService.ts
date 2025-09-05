import { Database } from "./Database";

export class UserService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  register(user: string) {
    this.db.save(user);
  }
}
