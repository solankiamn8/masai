class Book {
    title: string;
    author: string;
    reviews: string[];
  
    constructor(title: string, author: string, reviews: string[]) {
      this.title = title;
      this.author = author;
      this.reviews = reviews;
    }
  
    // ✅ Fixed: Deep copy for reviews
    clone(): Book {
      return new Book(this.title, this.author, [...this.reviews]);
    }
  
    toString(): string {
      return `Book [Title=${this.title}, Author=${this.author}, Reviews=${this.reviews.join(", ")}]`;
    }
  }
  
  // ✅ Example usage
  const original = new Book("Design Patterns", "GoF", [
    "Excellent read!",
    "Very informative."
  ]);
  
  const copy = original.clone();
  copy.reviews.push("Must-have for developers.");
  
  console.log("Original:", original.toString());
  console.log("Clone:", copy.toString());
  