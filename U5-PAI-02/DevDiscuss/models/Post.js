const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const postSchema = new Schema(
  {
    title: { type: String, required: true, minLength: 5 },
    content: { type: String, required: true, minLength: 20 },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String }], 
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    comments: [commentSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
