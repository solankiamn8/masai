const express = require("express");
const router = express.Router();
const controller = require("../controllers/rental.controller");

router.post("/add-user", controller.addUser);
router.post("/add-book", controller.addBook);
router.post("/rent-book", controller.rentBook);
router.post("/return-book", controller.returnBook);
router.get("/user-rentals/:userId", controller.getUserRentals);
router.get("/book-renters/:bookId", controller.getBookRenters);
router.put("/update-book/:bookId", controller.updateBook);
router.delete("/delete-book/:bookId", controller.deleteBook);

module.exports = router;
