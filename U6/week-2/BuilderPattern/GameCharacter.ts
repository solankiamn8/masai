// GameCharacter.ts

class GameCharacter {
    name: string;
    level: number;
    weapon: string;
  
    constructor(name: string, level: number, weapon: string) {
      this.name = name;
      this.level = level;
      this.weapon = weapon;
    }
  
    // ✅ Prototype method (clone)
    clone(): GameCharacter {
      return new GameCharacter(this.name, this.level, this.weapon);
    }
  
    toString(): string {
      return `Character [Name=${this.name}, Level=${this.level}, Weapon=${this.weapon}]`;
    }
  }
  
  // Example usage (main)
  const warrior = new GameCharacter("Warrior", 10, "Sword");
  
  // Clone warrior
  const warriorClone = warrior.clone();
  warriorClone.name = "Warrior Clone"; // change name to differentiate
  
  console.log(warrior.toString());
  console.log(warriorClone.toString());
''  