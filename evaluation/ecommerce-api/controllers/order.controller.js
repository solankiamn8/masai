const Order = require("../models/order.model")
const Product = require("../models/product.model")

exports.placeOrder = async (req, res) => {
    const { userId, products } = req.body

    let totalAmount = 0;
    for(let item of products){
        const product = await Product.findById(item.productId)
        totalAmount += product.price * item.quantity;
    }

    const order = new Order({ userId, products, totalAmount})
    await order.save()
    res.status(201).json(order)
}


exports.getAllOrders = async (req, res) => {
    const orders = await Order.find()
    .populate("userId", "name email")
    .populate("products.productId", "name price category")    
    res.json(orders)
}


exports.getOrdersAfterDate = async (req, res) => {
    const orders = await Order.find({ orderedAt: {$gte: new Date("2024-01-01")}})
    res.json(orders)
}


exports.getOrders = async (req, res) => {
    let orders = await Order.find()
    .populate("products.productId", "category")
    .populate("userId")
    .then(orders => orders.filter(order => 
        order.products.some(p => ["electronics", "clothing"].includes(p.productId.category))
    ))
    res.json(orders)
}


exports.deleteOrder = async (req, res) => {
    await Order.findByIdAndDelete(req.params.id)
    res.sendStatus(204)
}