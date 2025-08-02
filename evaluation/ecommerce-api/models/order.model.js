const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.ObjectId, ref: "User", required: true },
    products: [
        {
            productId: { type: mongoose.Schema.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true, min: 1},
        }
    ],
    totalAmount: {type: Number, required: true, min: 1},
    orderedAt: {type: Date, default: Date.now}
})

module.exports = mongoose.model("Order", orderSchema)