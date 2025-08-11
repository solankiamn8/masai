let mongoose = require('mongoose')

let connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('MongoDB connected')
    } catch (error) {
        console.log('MongoDB connection error', error)
    }
}

module.exports = connectDB;