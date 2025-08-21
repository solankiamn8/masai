const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
  addComment,
  toggleUpvote
} = require('../controllers/postController');

router.get('/', getAllPosts);
router.get('/:postId', getPostById);

router.post('/', authMiddleware, createPost);
router.delete('/:postId', authMiddleware, deletePost);

router.post('/:postId/comments', authMiddleware, addComment);
router.post('/:postId/upvote', authMiddleware, toggleUpvote);

module.exports = router;
