const Publisher = require('../models/publisherModel')
const Game = require('../models/gameModel')

exports.createGame = async(req, res)=>{
    try {
        const {title, genre, releaseDate, publisher } = req.body

        const pub = await Publisher.findById(publisher)
        if(!pub) return res.status(400).json({message: 'Provided publisher ID does not exist'})

        const game = await Game.create({ title, genre, releaseDate, publisher})
        res.status(201).json({ requestTimeStamp: req.requestTimeStamp, data: game})
    } catch (err) {
        res.status(500).json({message: 'Server error', error: err.message})
    }
}
exports.getGames = async(req, res)=>{
    try {
        const games = await Game.find().populate('publisher', 'name location')
        res.json({requestTimeStamp: req.requestTimeStamp, data: games})
    } catch (err) {
        res.status(500).json({message: 'Server error', error: err.message})
    }
}

exports.getGameById = async(req, res)=>{
    try {
        const game = await Game.findById(req.params.id).populate('publisher', 'name location');
        if(!game) return res.status(404).json({message: 'Game Not Found'});
        res.json({requestTimeStamp: req.requestTimeStamp, data: game});
    } catch (err) {
        res.status(500).json({message: 'Server error', error: err.message});
    }
}

exports.updateGame = async(req, res)=>{
    try {
        if(req.body.publisher){
            const pub = await Publisher.findById(req.body.publisher)
            if(!pub) return res.status(400).json({message: 'Provided publisher Id does not exist'})
        }
        const updated = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true}).populate('publisher', 'name location')
        if(!updated) return res.status(404).json({message: 'Game not found'})
        res.json({requestTimeStamp: req.requestTimeStamp, data: updated})
    } catch (err) {
        res.status(500).json({message: 'Server error', error: err.message})
    }
}
exports.deleteGame = async(req, res)=>{
    try {
        const removed = await Game.findByIdAndDelete(req.params.id)
        if(!removed) return res.status(404).json({message: 'Game Not Found'})
        res.json({requestTimeStamp: req.requestTimeStamp, message: 'Game deleted'})
    } catch (err) {
        res.status(500).json({message: 'Server error', error: err.message})
    }
}