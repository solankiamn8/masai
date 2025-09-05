import { MySQLService } from "./MySQLService";
import { UserService } from "./UserService";

const mysqlService = new MySQLService();

// Using MySQL
const userService1 = new UserService(mysqlService);
userService1.register("Aman");
