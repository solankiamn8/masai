const Post = require('../models/Post');

const createPost = async (req, res) => {
  try {
    const { title, content, tags = [] } = req.body;
    const cleanTags = [...new Set(tags.map(t => String(t).toLowerCase().trim()))]; // unique + normalized

    const post = await Post.create({
      title,
      content,
      author: req.user._id,
      tags: cleanTags
    });

    const populated = await post.populate('author', 'username email role');
    res.status(201).json({ message: 'Post created', post: populated });
  } catch (err) {
    res.status(400).json({ message: 'Create post failed', error: err.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const { tag } = req.query;
    let filter = {};
    if (tag) {
      filter.tags = String(tag).toLowerCase().trim();
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate('author', 'username email role');

    res.json({ count: posts.length, posts });
  } catch (err) {
    res.status(500).json({ message: 'Fetch posts failed', error: err.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'username email role')
      .populate('comments.user', 'username email role');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ post });
  } catch (err) {
    res.status(400).json({ message: 'Fetch post failed', error: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate('author', 'id username role');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isOwner = String(post.author._id) === String(req.user._id);
    const isModerator = req.user.role === 'Moderator';

    if (!isOwner && !isModerator) {
      return res.status(403).json({ message: 'Not allowed to delete this post' });
    }
    await Post.findByIdAndDelete(post._id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Delete post failed', error: err.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Text is required' });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ user: req.user._id, text: text.trim() });
    await post.save();

    const populated = await Post.findById(post._id).populate('comments.user', 'username email role');
    res.status(201).json({ message: 'Comment added', comments: populated.comments });
  } catch (err) {
    res.status(400).json({ message: 'Add comment failed', error: err.message });
  }
};

const toggleUpvote = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = String(req.user._id);
    const index = post.upvotes.findIndex(u => String(u) === userId);

    if (index >= 0) {
      post.upvotes.splice(index, 1);
    } else {
      post.upvotes.push(req.user._id);
    }
    await post.save();

    res.json({ message: 'Upvote toggled', upvotesCount: post.upvotes.length, upvotes: post.upvotes });
  } catch (err) {
    res.status(400).json({ message: 'Toggle upvote failed', error: err.message });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
  addComment,
  toggleUpvote
};
