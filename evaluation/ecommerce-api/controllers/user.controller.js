const User = require("../models/user.model")
const Order = require("../models/order.model")


exports.createUser = async (req, res) => {
    const user = new User(req.body)
    await user.save()
    res.status(201).json(ser)
}

exports.getAllUser = async (req, res) => {
    const users = await User.find()
    res.json(users)
}

exports.getUsersWithOrders = async (req, res) => {
    const users = await Order.aggregate([
        { $group: {_id: "$userId"}},
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userInfo"
            }
        },
        { $unwind: "$userInfo"},
        { $replaceRoot: { newRoot: "$userInfo"}}
    ])
    res.json(users)
}