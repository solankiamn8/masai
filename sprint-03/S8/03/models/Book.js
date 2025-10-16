const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, minlength: 3 },
  author: { type: String, required: true },
  status: {
    type: String,
    enum: ["available", "borrowed"],
    required: true,
    default: "available"
  },
  borrowers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Member" }],
  createdAt: { type: Date, default: Date.now }
});

// Pre hook: Ensure book is available before borrowing
bookSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "borrowed" && this.borrowers.length === 0) {
    return next(new Error("Cannot mark as borrowed without any borrower"));
  }
  next();
});

// Post hook: after return, if borrowers empty → mark available
bookSchema.post("save", function (doc, next) {
  if (doc.borrowers.length === 0 && doc.status !== "available") {
    doc.status = "available";
    doc.save().then(() => next());
  } else {
    next();
  }
});

module.exports = mongoose.model("Book", bookSchema);
