const User = require("../models/User");
const Book = require("../models/Book");

// Add a new user
exports.addUser = async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

// Add a new book
exports.addBook = async (req, res, next) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
};

// Rent a book
exports.rentBook = async (req, res, next) => {
  const { bookId, userId } = req.body;
  try {
    const user = await User.findById(userId);
    const book = await Book.findById(bookId);
    if (!user || !book) return res.status(404).json({ message: "User or Book not found" });

    if (!user.rentedBooks.includes(bookId)) {
      user.rentedBooks.push(bookId);
      await user.save();
    }

    if (!book.rentedBy.includes(userId)) {
      book.rentedBy.push(userId);
      await book.save();
    }

    res.json({ message: "Book rented successfully" });
  } catch (err) {
    next(err);
  }
};

// Return a book
exports.returnBook = async (req, res, next) => {
  const { bookId, userId } = req.body;
  try {
    const user = await User.findById(userId);
    const book = await Book.findById(bookId);
    if (!user || !book) return res.status(404).json({ message: "User or Book not found" });

    user.rentedBooks = user.rentedBooks.filter(id => id.toString() !== bookId);
    book.rentedBy = book.rentedBy.filter(id => id.toString() !== userId);

    await user.save();
    await book.save();

    res.json({ message: "Book returned successfully" });
  } catch (err) {
    next(err);
  }
};

// Get all books rented by a user
exports.getUserRentals = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).populate("rentedBooks");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.rentedBooks);
  } catch (err) {
    next(err);
  }
};

// Get all users who rented a specific book
exports.getBookRenters = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.bookId).populate("rentedBy");
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book.rentedBy);
  } catch (err) {
    next(err);
  }
};

// Update book
exports.updateBook = async (req, res, next) => {
  try {
    const updated = await Book.findByIdAndUpdate(req.params.bookId, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Book not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete book and update users
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    await User.updateMany(
      { rentedBooks: book._id },
      { $pull: { rentedBooks: book._id } }
    );

    res.json({ message: "Book deleted and removed from users" });
  } catch (err) {
    next(err);
  }
};
