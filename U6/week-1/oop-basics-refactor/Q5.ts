class User {
    public name: string;
    private orgCode: string = "DuckCorp";
    protected role: string;

    constructor(name: string, role: string) {
        this.name = name;
        this.role = role;
    }

    introduce(): void {
        console.log(`I am ${this.name} from ${this.orgCode}`);
    }
}

class Manager extends User {
    getRole(): void {
        console.log(this.role); // ✅ Allowed (protected accessible in subclass)
    }
}

// Testing
const user = new User("Daffy", "User");
user.introduce(); 
// console.log(user.orgCode); ❌ Compile Error: private property

const manager = new Manager("Donald", "Manager");
manager.introduce();
manager.getRole();
