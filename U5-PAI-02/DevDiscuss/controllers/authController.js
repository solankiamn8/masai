require('dotenv').config()
const jwt = require('jsonwebtoken');
const user = require('../models/user');


const signToken = (userId) => jwt.sign({ if: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
})

exports.register = async (req, res) => {
    try{
        const {username, email, password, role } = req.body;
        const user = await user.create({ username, email, password, role})
        const token = signToken(user._id)
        res.status(201).json({ msg: 'User Registered', user , token})
    }catch(err){
        console.log("Error in registering", err)
        res.status(400).json({msg: "Registration Failed"})
    }
}