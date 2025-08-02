const app = require("./app")
const mongoose = require("mongoose")

const PORT = 3000
const MONGO_URI = "mongodb://127.0.0.1:27017/ecommerce"

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>{
    console.log("Connected to MongoDB")
    app.listen(PORT, ()=>{
        console.log(`Server running at port ${PORT}`);
    })
})
.catch(err => console.log("MongoDB connection error", err))