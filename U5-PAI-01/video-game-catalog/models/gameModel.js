const mongoose = require("mongoose");
const Publisher = require("../models/publisherModel");

const VALID_GENRES = ['RPG', 'Action', 'Adventure', 'Strategy', 'Sports']

const gameSchema = new mongoose.Schema({
    title: {type: String, required: true},
    genre: {type: String, enum: VALID_GENRES},
    releaseDate: {type: Date},
    publisher: {type: mongoose.Schema.Types.ObjectId, ref: 'Publisher', required: true}
},{
    timestamps: true
});

const Game = mongoose.model('Game', gameSchema)
module.exports = Game;