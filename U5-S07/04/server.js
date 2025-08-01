const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());

const DB_PATH = './db.json';

// Helper: Read books from db.json
const readBooks = () => {
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data).books;
};

// Helper: Write books to db.json
const writeBooks = (books) => {
  fs.writeFileSync(DB_PATH, JSON.stringify({ books }, null, 2));
};

// POST /books → Add a new book
app.post('/books', (req, res) => {
  const { title, author, year } = req.body;
  if (!title || !author || !year) {
    return res.status(400).json({ error: 'Missing book details' });
  }
  const books = readBooks();
  const id = books.length > 0 ? books[books.length - 1].id + 1 : 1;
  const newBook = { id, title, author, year };
  books.push(newBook);
  writeBooks(books);
  res.status(201).json(newBook);
});

// GET /books → Retrieve all books
app.get('/books', (req, res) => {
  const books = readBooks();
  res.status(200).json(books);
});

// GET /books/:id → Retrieve book by ID
app.get('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const books = readBooks();
  const book = books.find(b => b.id === id);
  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ error: 'Book not found' });
  }
});

// PUT /books/:id → Update book by ID
app.put('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, author, year } = req.body;
  const books = readBooks();
  const index = books.findIndex(b => b.id === id);
  if (index !== -1) {
    books[index] = { id, title, author, year };
    writeBooks(books);
    res.status(200).json(books[index]);
  } else {
    res.status(404).json({ error: 'Book not found' });
  }
});

// DELETE /books/:id → Delete book by ID
app.delete('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let books = readBooks();
  const book = books.find(b => b.id === id);
  if (book) {
    books = books.filter(b => b.id !== id);
    writeBooks(books);
    res.status(200).json({ message: 'Book deleted successfully' });
  } else {
    res.status(404).json({ error: 'Book not found' });
  }
});

// GET /books/search?author=&title= → Search by author or title (partial match)
app.get('/books/search', (req, res) => {
  const { author, title } = req.query;
  const books = readBooks();
  let results = books;

  if (author) {
    const authorLower = author.toLowerCase();
    results = results.filter(book =>
      book.author.toLowerCase().includes(authorLower)
    );
  }

  if (title) {
    const titleLower = title.toLowerCase();
    results = results.filter(book =>
      book.title.toLowerCase().includes(titleLower)
    );
  }

  if (results.length > 0) {
    res.status(200).json(results);
  } else {
    res.status(404).json({ message: 'No books found' });
  }
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ error: '404 Not Found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
