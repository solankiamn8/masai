const Publisher = require('../models/publisherModel')
const Game = require('../models/gameModel')
const requestTimeStamp = require('../middleware/requestTimeStamp')

exports.createPublisher = async(req, res)=>{
    try {
        const {name, location, yearEstablished} = req.body
        const publisher = await Publisher.create({ name, location, yearEstablished})
        res.status(201).json({requestTimeStamp: req.requestTimeStamp, data: publisher})
    } catch (err) {
        res.status(500).json({message: 'Server error', error: err.message})
    }
}
exports.getPublisher = async(req, res)=>{
    try {
        const publishers = await Publisher.find()
        res.json({requestTimeStamp: req.requestTimeStamp, data: publishers})
    } catch (err) {
        res.status(500).json({message: 'Server error', error: err.message})
    }
}
exports.getPublisherById = async(req, res)=>{
    try {
        const pub = await Publisher.findById(req.params.id)
        if(!pub) return res.status(404).json({message: 'Publisher Not Found'})
        res.json({requestTimeStamp: req.requestTimeStamp, data: pub})
    } catch (err) {
        res.status(500).json({message: 'Server error', error: err.message})
    }
}
exports.updatePublisher = async(req, res)=>{
    try {
        const updated = await Publisher.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        if(!updated) return res.status(404).json({message: 'Publisher Not Found'})
        res.json({requestTimeStamp: req.requestTimeStamp, data: updated})
    } catch (err) {
        res.status(500).json({message: 'Server error', error: err.message})
    }
}
exports.deletePublisher = async(req, res)=>{
    try {
        const removed = await Publisher.findByIdAndDelete(req.params.id)
        if(!removed) return res.status(404).json({message: 'Publisher Not Found'})
        res.json({requestTimeStamp: req.requestTimeStamp, message: 'Publisher deleted'})
    } catch (err) {
        res.status(500).json({message: 'Server error', error: err.message})
    }
}
exports.getGameByPublisher = async(req, res)=>{
    try {
        const publisherExists = await Publisher.findById(req.params.publisherId);
        if (!publisherExists) return res.status(404).json({ message: 'Publisher Not Found' });

        const games = await Game.find({ publisher: req.params.publisherId }).populate('publisher', 'name location');
        res.json({ requestTimeStamp: req.requestTimeStamp, data: games });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}



