const mongoose = require("mongoose");

let publisherSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true },
    location: {type: String},
    yearEstablished: {type: Number, min: 1950},
}, {
    timestamps: true
})