const Product = require("../models/product.model");

exports.createProduct = async (req, res) => {
    const product = new Product(req.body)
    await product.save()
    res.status(201).json(product)
}

exports.getAllProducts = async (req, res) => {
    const products = await Product.find()
    res.json(products)
}

exports.getProductsByPrice = async (req, res) => {
    const products = await Product.find({price: {$gte: 1000} })
    res.json(products)
}


exports.updateProduct = async (req, res) => {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {new: true})
    res.json(updated)
}


exports.deleteProduct = async (req, res) => {
    await Product.findByIdAndDelete(req.params.id)
    res.sendStatus(204)
}