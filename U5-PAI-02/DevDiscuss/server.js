require('dotenv').config()
const express = require("express")
const authRouter = require('./routes/authRoutes');
const postRouter = require('./routes/postRoutes');
const analyticsRouter = require('./routes/analyticsRoutes');
const connectToDB = require('./config/db');

const app = express();

connectToDB(process.env.MONGO_URI)

app.use(express.json());    // Global Middleware

app.use('/api/auth', authRouter)
app.use('/api/post', postRouter)
app.use('/api/analytics', analyticsRouter)

app.use('/test', (req, res)=>{
    res.status(200).json({msg: "This is a test route"})
})

app.use("*", (req, res)=>{
    res.status(404).json({msg: "Wrong request"})
})

const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{
    console.log(`Server started at PORT : ${PORT}`)
})