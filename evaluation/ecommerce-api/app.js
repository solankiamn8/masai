const express = require("express")
const app = express()

app.use(express.json());

const productRoutes = require("./routes/product.routes.js")
const userRoutes = require("./routes/user.routes.js")
const orderRoutes = require("./routes/order.routes.js")
const analyticsRoutes = require("./routes/analytics.routes.js")

app.use("/products", productRoutes)
app.use("/users", userRoutes)
app.use("/orders", orderRoutes)
app.use("/analytics", analyticsRoutes)

app.use((err, req, res, next) => {
    res.status(500).json({error: err.message })
})

module.exports = app;