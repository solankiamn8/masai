const Library = require('../models/library.model');

// Validate required fields middleware for adding book
const validateBookData = (req, res, next) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ error: 'Incomplete Data' });
  }
  next();
};

// Borrowing limit middleware: max 3 books per user
const checkBorrowLimit = async (req, res, next) => {
  const { borrowerName } = req.body;
  const borrowedBooks = await Library.find({
    borrowerName,
    status: 'borrowed'
  });

  if (borrowedBooks.length >= 3) {
    return res.status(409).json({ error: 'Borrowing limit exceeded (Max 3 books).' });
  }
  next();
};

// Middleware to check if book is borrowed before deletion
const checkBookNotBorrowed = async (req, res, next) => {
  try {
    const book = await Library.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    if (book.status === 'borrowed') {
      return res.status(409).json({ error: 'Cannot delete a borrowed book' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  validateBookData,
  checkBorrowLimit,
  checkBookNotBorrowed
};
