// Pizza.ts

class Pizza {
    private size: string;
    private cheese: boolean;
    private pepperoni: boolean;
    private mushrooms: boolean;
  
    private constructor(builder: PizzaBuilder) {
      this.size = builder.size;
      this.cheese = builder.cheese;
      this.pepperoni = builder.pepperoni;
      this.mushrooms = builder.mushrooms;
    }
  
    public toString(): string {
      return `Pizza [Size=${this.size}, Cheese=${this.cheese}, Pepperoni=${this.pepperoni}, Mushrooms=${this.mushrooms}]`;
    }
  
    // Allow builder to access constructor
    static create(builder: PizzaBuilder) {
      return new Pizza(builder);
    }
  }
  
  class PizzaBuilder {
    size: "Small" | "Medium" | "Large" = "Medium";
    cheese: boolean = false;
    pepperoni: boolean = false;
    mushrooms: boolean = false;
  
    setSize(size: "Small" | "Medium" | "Large") {
      this.size = size;
      return this;
    }
  
    setCheese(cheese: boolean) {
      this.cheese = cheese;
      return this;
    }
  
    setPepperoni(pepperoni: boolean) {
      this.pepperoni = pepperoni;
      return this;
    }
  
    setMushrooms(mushrooms: boolean) {
      this.mushrooms = mushrooms;
      return this;
    }
  
    build() {
      return Pizza.create(this);
    }
  }
  
  // ✅ Usage
  const myPizza = new PizzaBuilder()
    .setSize("Large")
    .setCheese(true)
    .setMushrooms(true)
    .build();
  
  console.log(myPizza.toString());
  