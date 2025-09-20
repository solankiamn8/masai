let products = [
  { id: 1, name: "Laptop", price: 60000, category: "Electronics" },
  { id: 2, name: "Shoes", price: 2000, category: "Fashion" },
  { id: 3, name: "Phone", price: 40000, category: "Electronics" },
];

const [firstProduct, secondProduct] = products;
console.log("First Product: ", firstProduct);
console.log("Second Product: ", secondProduct);

let nextId = products.length + 1;
function addProducts(name = "Unknown", price = 0, category = "Miscellaneous") {
  const newProduct = { id: nextId++, name, price, category };

  products = [...products, newProduct];
  return newProduct;
}

function getProductByCategory(...category) {
  return products.filter((product) => category.includes(product.category));
}

const newProd = addProducts("Watch", 5000, "Fashion");
console.log("New Product Added: ", newProd);

const filterProducts = getProductByCategory("Fashion", "Electronics");
console.log("Filtered Products (Fashion & Electronics): ", filterProducts);

console.log("\nFull Product List")
products.forEach(({name, price, category}) => {
    console.log(`Product: ${name} | Price: ${price} | Category: ${category}`)
})