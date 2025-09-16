// Car.ts

class Car {
    private brand: string;
    private engine: string;
    private color: string;
    private sunroof: boolean;
    private automaticTransmission: boolean;
  
    private constructor(builder: CarBuilder) {
      this.brand = builder.brand;
      this.engine = builder.engine;
      this.color = builder.color;
      this.sunroof = builder.sunroof;
      this.automaticTransmission = builder.automaticTransmission;
    }
  
    public toString(): string {
      return `Car [Brand=${this.brand}, Engine=${this.engine}, Color=${this.color}, Sunroof=${this.sunroof}, Automatic Transmission=${this.automaticTransmission}]`;
    }
  
    // Factory method to allow CarBuilder to create Car
    static create(builder: CarBuilder) {
      return new Car(builder);
    }
  }
  
  class CarBuilder {
    brand: string = "";
    engine: string = "";
    color: string = "";
    sunroof: boolean = false;
    automaticTransmission: boolean = false;
  
    setBrand(brand: string) {
      this.brand = brand;
      return this;
    }
  
    setEngine(engine: string) {
      this.engine = engine;
      return this;
    }
  
    setColor(color: string) {
      this.color = color;
      return this;
    }
  
    setSunroof(sunroof: boolean) {
      this.sunroof = sunroof;
      return this;
    }
  
    setAutomaticTransmission(automatic: boolean) {
      this.automaticTransmission = automatic;
      return this;
    }
  
    build() {
      return Car.create(this);
    }
  }
  
  // ✅ Usage
  const myCar = new CarBuilder()
    .setBrand("Tesla Model S")
    .setEngine("Electric")
    .setColor("Black")
    .setSunroof(true)
    .setAutomaticTransmission(true)
    .build();
  
  console.log(myCar.toString());
  