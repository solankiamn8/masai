const Book = require("../models/Book");
const Member = require("../models/Member");

// Add Book
exports.addBook = async (req, res, next) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
};

// Add Member
exports.addMember = async (req, res, next) => {
  try {
    const member = new Member(req.body);
    await member.save();
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
};

// Borrow Book
exports.borrowBook = async (req, res, next) => {
  const { bookId, memberId } = req.body;
  try {
    const book = await Book.findById(bookId);
    const member = await Member.findById(memberId);

    if (!book || !member) return res.status(404).json({ message: "Book or Member not found" });
    if (book.status === "borrowed") return res.status(400).json({ message: "Book already borrowed" });

    book.status = "borrowed";
    book.borrowers.push(member._id);
    member.borrowedBooks.push(book._id);

    await book.save();
    await member.save();

    res.json({ message: "Book borrowed successfully" });
  } catch (err) {
    next(err);
  }
};

// Return Book
exports.returnBook = async (req, res, next) => {
  const { bookId, memberId } = req.body;
  try {
    const book = await Book.findById(bookId);
    const member = await Member.findById(memberId);

    if (!book || !member) return res.status(404).json({ message: "Book or Member not found" });

    book.borrowers = book.borrowers.filter(id => id.toString() !== memberId);
    member.borrowedBooks = member.borrowedBooks.filter(id => id.toString() !== bookId);

    if (book.borrowers.length === 0) {
      book.status = "available";
    }

    await book.save();
    await member.save();

    res.json({ message: "Book returned successfully" });
  } catch (err) {
    next(err);
  }
};

// Get all books borrowed by a member
exports.getMemberBorrowedBooks = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.memberId).populate("borrowedBooks");
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.json(member.borrowedBooks);
  } catch (err) {
    next(err);
  }
};

// Get all members who borrowed a book
exports.getBookBorrowers = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.bookId).populate("borrowers");
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book.borrowers);
  } catch (err) {
    next(err);
  }
};

// Update Book
exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.bookId, req.body, { new: true });
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    next(err);
  }
};

// Delete Book
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    await Member.updateMany(
      { borrowedBooks: book._id },
      { $pull: { borrowedBooks: book._id } }
    );

    res.json({ message: "Book deleted and removed from member records" });
  } catch (err) {
    next(err);
  }
};
