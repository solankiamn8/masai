const express = require("express")
const router = express.Router()
const userController = require("../controllers/user.controller")

router.post("/", userController.createUser)
router.get("/", userController.getAllUser)
router.get("/with-orders", userController.getUsersWithOrders)

module.exports = router;