require('dotenv').config()
const express = require('express')
const connectDB = require('./config/db')
const requestTimeStamp = require('./middleware/requestTimeStamp')

const publisherRoutes = require('./routes/publisherRoutes')
const gameRoutes = require('./routes/gameRoutes')

const app = express()
connectDB();

app.use(express.json())
app.use(requestTimeStamp);

app.use('/api/publishers', publisherRoutes)
app.use('/api/games', gameRoutes)

app.get('/', (req, res)=> res.send(`API up. Request time: ${req.requestTimeStamp}`))

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))