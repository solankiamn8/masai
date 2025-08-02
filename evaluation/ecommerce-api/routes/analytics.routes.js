const express = require("express")
const router = express.Router()
const analyticsController = require("../analytics/analytics.controller")

router.get("/top-products", analyticsController.getTopProducts)

module.exports = router;
