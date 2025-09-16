// Device Interface
interface Device {
    specifications(): void;
  }
  
  // Concrete Devices
  class AppleLaptop implements Device {
    specifications(): void {
      console.log("Apple Laptop: M2 Chip, 16GB RAM, 512GB SSD");
    }
  }
  
  class ApplePhone implements Device {
    specifications(): void {
      console.log("Apple Phone: A17 Chip, 8GB RAM, 256GB Storage");
    }
  }
  
  class SamsungLaptop implements Device {
    specifications(): void {
      console.log("Samsung Laptop: Intel i7, 16GB RAM, 1TB SSD");
    }
  }
  
  class SamsungPhone implements Device {
    specifications(): void {
      console.log("Samsung Phone: Exynos 2200, 12GB RAM, 256GB Storage");
    }
  }
  
  // Abstract Factory Interface
  interface DeviceFactory {
    createDevice(type: "Laptop" | "Phone"): Device;
  }
  
  // Concrete Factories
  class AppleFactory implements DeviceFactory {
    createDevice(type: "Laptop" | "Phone"): Device {
      if (type === "Laptop") return new AppleLaptop();
      else return new ApplePhone();
    }
  }
  
  class SamsungFactory implements DeviceFactory {
    createDevice(type: "Laptop" | "Phone"): Device {
      if (type === "Laptop") return new SamsungLaptop();
      else return new SamsungPhone();
    }
  }
  
  // ✅ Usage (main)
  function main() {
    const appleFactory: DeviceFactory = new AppleFactory();
    const samsungFactory: DeviceFactory = new SamsungFactory();
  
    const appleLaptop: Device = appleFactory.createDevice("Laptop");
    const samsungPhone: Device = samsungFactory.createDevice("Phone");
  
    appleLaptop.specifications();
    samsungPhone.specifications();
  }
  
  main();
  