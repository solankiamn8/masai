Q: 4
Problem Statement: "CodeBrew" - A Coffee Shop Order Management System
Core Objective
You are tasked with designing and modeling the backend logic for a coffee shop's order management system called "CodeBrew." This is not a UI or API development task. Your goal is to apply your knowledge of Object-Oriented Programming (OOP), SOLID principles, and key Design Patterns to create a well-structured, scalable, and maintainable system using TypeScript.

The deliverable is a set of TypeScript files that define the classes, interfaces, and relationships of the system.

System Requirements
The system must be able to model the following scenarios:

A customer can order a base coffee (e.g., Espresso, Latte).
The customer can customize their coffee by adding extras (e.g., Milk, Caramel Syrup, Whipped Cream). Each extra adds to the total cost.
An order progresses through several states: Pending -> Preparing -> Ready -> Completed.
The system must be able to process payments using different methods (e.g., Credit Card, Digital Wallet).
A central system needs to keep track of all active orders.
A customer-facing display screen needs to be updated when an order's status changes to Ready.
Technical & Design Pattern Implementation
You must implement the system's logic using the following specific design patterns and principles:

TypeScript & OOP Foundation:

All code must be written in TypeScript.
Use classes, interfaces, and types to model the system entities, ensuring strong typing and clear contracts between different parts of your code.
Decorator Pattern for Coffee Customization:

Create a base Coffee interface/class.
Create concrete coffee types like Espresso and Latte.
Use the Decorator Pattern to add extras like Milk, CaramelSyrup, etc. Each decorator must modify the getCost() and getDescription() methods of the base coffee.
State Pattern for Order Lifecycle:

Create an Order class.
The lifecycle of an order (Pending, Preparing, Ready, Completed) must be managed using the State Pattern.
The Order class will have a state property, and its behavior (e.g., proceedToNextState(), cancelOrder()) will change depending on its current state.
Strategy Pattern for Payments:

Create a PaymentStrategy interface with a pay(amount) method.
Implement concrete strategies like CreditCardPayment and DigitalWalletPayment.
The Order class should use the Strategy Pattern to process payments, allowing the payment method to be set dynamically.
Observer Pattern for Notifications:

The Order class should be the "Subject" (or Observable).
Create an "Observer" interface and a concrete CustomerDisplay observer.
Use the Observer Pattern so that when an Order's state changes to Ready, it automatically notifies the CustomerDisplay observer.
Singleton Pattern for Order Management:

Create an OrderManager class responsible for adding new orders and tracking all active orders.
This class must be implemented as a Singleton to ensure there is only one central point of order management throughout the application.
SOLID Principles:

Throughout your design, strive to adhere to SOLID principles (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion). Be prepared to add comments in your code to briefly justify key design decisions.
Deliverables
A collection of .ts files containing the interfaces and classes for your system (e.g., Coffee.ts, Order.ts, Payment.ts, OrderManager.ts, etc.).
An index.ts file that demonstrates how your system works. This file should contain a "main" function that simulates a real-world scenario:
Create a coffee order (e.g., a Latte).
Add decorators to it (e.g., Milk and Caramel).
Create an Order with this coffee.
Process the payment using one of the strategies.
Change the order's state and show that the observer is notified.
Submission Guideline
Submit your root directory's git repo link , this will be specifically the folder that you worked on today's evaluation and you submit the parent folder of it .
All changes saved

Enter your answer here
