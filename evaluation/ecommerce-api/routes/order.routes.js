const express = require("express")
const router = express.Router()
const orderController = require("../controllers/order.controller")

router.post("/", orderController.placeOrder)
router.get("/", orderController.getAllOrders)
router.get("/filter/date", orderController.getOrdersAfterDate)
router.get("/filter/category", orderController.getOrdersByCategory)
router.delete("/:id", orderController.deleteOrder)


module.exports = router;
