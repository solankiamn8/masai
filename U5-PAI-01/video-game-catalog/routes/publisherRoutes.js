const express = require('express')
const router = express.Router()
const publisherController = require('../controllers/publisherController')

router.post('/', publisherController.createPublisher)
router.get('/', publisherController.getPublisher)
router.get('/:id', publisherController.getPublisherById)
router.put('/:id', publisherController.updatePublisher)
router.delete('/:id', publisherController.deletePublisher)

router.get('/:publisherId/game', publisherController.getGameByPublisher)

module.exports = router