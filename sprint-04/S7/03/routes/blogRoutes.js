const express = require('express');
const Blog = require('../models/blogModel');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * POST /blogs
 * Create blog (protected)
 */
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const blog = new Blog({
      title,
      content,
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      createdBy: req.user.id,
    });
    await blog.save();
    res.status(201).json({ message: 'Blog created', blog });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * GET /blogs
 * Fetch all blogs created by logged-in user (protected)
 */
router.get('/', auth, async (req, res) => {
  try {
    const blogs = await Blog.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * PUT /blogs/:id
 * Update only if owner (protected)
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!blog) return res.status(404).json({ message: 'Blog not found or not owned by you' });

    const { title, content, tags } = req.body;
    if (title !== undefined) blog.title = title;
    if (content !== undefined) blog.content = content;
    if (tags !== undefined) blog.tags = Array.isArray(tags) ? tags : (tags ? [tags] : []);
    await blog.save();

    res.json({ message: 'Blog updated', blog });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * DELETE /blogs/:id
 * Delete only if owner (protected)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!blog) return res.status(404).json({ message: 'Blog not found or not owned by you' });

    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * GET /blogs/stats
 * Aggregation analytics across all blogs (protected)
 *
 * Returns:
 *  - totalBlogs: number
 *  - blogsPerUser: [{ userId, userEmail, count }]
 *  - topTags: [{ tag, count }]
 */
router.get('/stats', auth, async (req, res) => {
  try {
    // Total number of blogs
    const totalPromise = Blog.countDocuments();

    // Blog count per user (with user email)
    const perUserPromise = Blog.aggregate([
      { $group: { _id: '$createdBy', count: { $sum: 1 } } },
      // Join with users collection to get email/name
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          userEmail: '$user.email',
          userName: '$user.name',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Most common tags across all blogs
    const tagsPromise = Blog.aggregate([
      { $unwind: { path: '$tags', preserveNullAndEmptyArrays: false } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $project: { _id: 0, tag: '$_id', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 }, // top 10 tags
    ]);

    const [totalBlogs, blogsPerUser, topTags] = await Promise.all([totalPromise, perUserPromise, tagsPromise]);

    res.json({
      totalBlogs,
      blogsPerUser,
      topTags,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
