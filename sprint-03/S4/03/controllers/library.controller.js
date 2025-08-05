const Library = require('../models/library.model');

// Add new book
const addBook = async (req, res) => {
  try {
    const { title, author } = req.body;
    const newBook = new Library({ title, author });
    await newBook.save();
    res.status(201).json({ message: 'Book added', book: newBook });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Retrieve books with optional filters
const getBooks = async (req, res) => {
  const { status, title } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (title) filter.title = new RegExp(title, 'i'); // case-insensitive

  try {
    const books = await Library.find(filter);
    res.status(200).json({ books });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Borrow a book
const borrowBook = async (req, res) => {
  const { borrowerName } = req.body;
  try {
    const book = await Library.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    if (book.status !== 'available') {
      return res.status(409).json({ error: 'Book is not available for borrowing' });
    }

    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + 14);

    book.status = 'borrowed';
    book.borrowerName = borrowerName;
    book.borrowDate = borrowDate;
    book.dueDate = dueDate;

    await book.save();
    res.status(200).json({ message: 'Book borrowed', book });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Return a book
const returnBook = async (req, res) => {
  try {
    const book = await Library.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    if (book.status !== 'borrowed') {
      return res.status(409).json({ error: 'Book is not borrowed' });
    }

    const returnDate = new Date();
    book.status = 'available';
    book.returnDate = returnDate;

    if (returnDate > book.dueDate) {
      const overdueDays = Math.ceil((returnDate - book.dueDate) / (1000 * 60 * 60 * 24));
      book.overdueFees = overdueDays * 10;
    }

    book.borrowerName = null;
    book.borrowDate = null;
    book.dueDate = null;

    await book.save();
    res.status(200).json({ message: 'Book returned', book });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete a book
const deleteBook = async (req, res) => {
  try {
    await Library.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  addBook,
  getBooks,
  borrowBook,
  returnBook,
  deleteBook
};
