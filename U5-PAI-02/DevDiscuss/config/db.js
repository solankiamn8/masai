const mongoose = require('mongoose')

const connectToDB = async (uri)=>{
    try{
        await mongoose.connect(uri)
        console.log("Connected to DB");
    }catch(err){
        console.log("Error Detected", err)
        res.json({msg: "Error connecting to DB"})
    }
}

module.exports = connectToDB;