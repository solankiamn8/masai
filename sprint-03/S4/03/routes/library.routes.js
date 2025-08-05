const express = require('express');
const router = express.Router();
const {
  addBook,
  getBooks,
  borrowBook,
  returnBook,
  deleteBook
} = require('../controllers/library.controller');

const {
  validateBookData,
  checkBorrowLimit,
  checkBookNotBorrowed
} = require('../middleware/library.middleware');

// Add book
router.post('/library/books', validateBookData, addBook);

// Get books (with optional filter)
router.get('/library/books', getBooks);

// Borrow book
router.patch('/library/borrow/:id', checkBorrowLimit, borrowBook);

// Return book
router.patch('/library/return/:id', returnBook);

// Delete book
router.delete('/library/books/:id', checkBookNotBorrowed, deleteBook);

module.exports = router;
