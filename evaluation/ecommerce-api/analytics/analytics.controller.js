const Order = require("../models/order.model")


exports.getTopProducts = async (req, res) => {
    const topProducts = await Order.aggregate([
        { $unwind: "$products"},
        { $group: {
            _id: "$products.productId",
            totalQuantity: { $sum: "products.quantity"}
        }},
        { $sort: {totalQuantity: -1}},
        { $limit: 3},
        { $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productInfo"
        }},
        { $unwind: "$productInfo" },
        { $project: {
            productId: "$_id",
            name: "$productInfo.name",
            category: "$productInfo.category",
            totalQuantity: 1
        }}
    ])
    res.json(topProducts)
}