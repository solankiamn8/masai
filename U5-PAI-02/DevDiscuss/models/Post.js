const mongoose = require('mongoose')
const { Schema } = mongoose

const commentSchema = new Schema(
    {
        user:{type: Schema.Types.ObjectId ,ref: 'User', required: true},
        text:{type: String, required: true, trim:true },
        createdAt: {type: Date, default: Date.now}
    },
    { _id:true }
)
const postSchema = new Schema(
    {
        title:{type: String, required: true, minLength:5 ,trim:true },
        content:{type: String, required: true, minLength:20 ,trim:true },
        author:{type: Schema.Types.ObjectId ,ref: 'User', required: true},
        tags:{type: Schema.Types.ObjectId ,ref: 'Tag'},
        upvotes:[{type: Schema.Types.ObjectId ,ref: 'User', default: []}],
        comments: [commentSchema]
    },
    { timestamps: true }
)
 

module.exports = mongoose.model('User', postSchema);