Q: 4
Problem Statement: "DevDiscuss" - A Community Forum API
Core Objective:

You are tasked with building the complete backend API for a community forum called "DevDiscuss." This platform will allow users to register, create posts on various topics, comment on posts, and upvote content. The system must also support different user roles with distinct permissions and provide an analytics endpoint for forum statistics.

Project Requirements:
Project Foundation & Architecture:
Initialize a new Node.js project and install necessary packages: express, mongoose, dotenv, bcryptjs, and jsonwebtoken.
The application must follow the MVC (Model-View-Controller) pattern, with a clear separation of concerns into models, controllers, and routes directories.
Use a .env file to manage environment variables like your database connection string, JWT secret, and server port.
Custom Middleware:
Create a simple custom middleware function for logging. For every incoming request, it should log the HTTP method, the request URL, and the current timestamp to the console. This middleware should be applied globally.
Data Models & Relationships:
You need to design and implement three core models and a junction model for a many-to-many relationship.

User Model:
username: String, required, unique.
email: String, required, unique, must be a valid email format.
password: String, required. Must be hashed using bcryptjs before being saved.
role: String, with an enum of ['User', 'Moderator'], and a default value of 'User'.
Tag Model:
name: String, required, unique, and should be stored in lowercase.
Post Model:
title: String, required, with a minimum length of 5 characters.
content: String, required, with a minimum length of 20 characters.
author: A reference to the User model (ObjectId), required.
tags: An array of ObjectIds, each referencing the Tag model. This creates a many-to-many relationship.
upvotes: An array of ObjectIds, each referencing a User. Defaults to an empty array.
comments: An array of embedded comment documents. Each comment sub-document should contain:
user: A reference to the User model.
text: String, required.
createdAt: Date, with a default value.
Authentication & Authorization:
Authentication: Implement a standard JWT-based authentication system.
POST /api/auth/register: Creates a new user.
POST /api/auth/login: Authenticates a user and returns a JWT.
Authorization: The API must enforce role-based access control.
Create two separate middleware functions: one to verify a valid JWT (authMiddleware) and another to check if the user has the 'Moderator' role (moderatorMiddleware).
User Role (User): Can create posts, comment on any post, upvote any post, and delete their own posts and comments.
Moderator Role (Moderator): Can do everything a User can do, but can also delete any post or comment.
API Endpoints:
Post Routes
POST /api/posts: (Protected: User or Moderator) Creates a new post. The request body can include an array of tag names. If a tag doesn't exist, it should be created.
GET /api/posts: (Public) Retrieves all posts, with author details populated. Should support filtering by tag name (e.g., ?tag=javascript).
GET /api/posts/:postId: (Public) Retrieves a single post with author and comments populated.
DELETE /api/posts/:postId: (Protected) Deletes a post. Logic must enforce that a User can only delete their own post, while a Moderator can delete any post.
Interaction Routes
POST /api/posts/:postId/comments: (Protected: User or Moderator) Adds a comment to a specific post.
POST /api/posts/:postId/upvote: (Protected: User or Moderator) Toggles an upvote for the user on a specific post. A user cannot upvote the same post twice.
Advanced Aggregation Endpoint
GET /api/analytics/stats: (Protected: Moderator only)
This is the key challenge. This endpoint must use the Mongoose Aggregation Pipeline to return a JSON object with the following statistics:
topActiveUsers: An array of the top 3 users with the most posts and comments combined.
mostUpvotedPosts: An array of the top 3 posts with the highest number of upvotes.
Topics Evaluated:
Backend Fundamentals: Node.js, npm, Express setup.
Express: Routing, request/response cycle, custom middleware.
MongoDB & Mongoose: Full CRUD, schema design with advanced validation (unique, enum, minlength).
Mongoose Relationships: One-to-many (User -> Post), embedded documents (Comments), and many-to-many (Post <-> Tag).
Authentication & Authorization: JWT implementation, password hashing, and role-based access control with middleware.
Mongoose Aggregations: Using aggregation pipelines ($lookup, $group, $sort, $limit, etc.) to derive complex analytics.
Submission Guidelines :
Submit you’re Github’s repository link , ensure that you’re submitting specifically the today’s evaluation directory link , failing to do so can lead to invalid submission .
All changes saved

https://github.com/solankiamn8/masai/tree/master/U5-PAI-02/DevDiscuss


 nodemon server.js
[nodemon] 3.1.10
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node server.js`
[dotenv@17.2.1] injecting env (2) from .env -- tip: ⚙️  suppress all logs with { quiet: true }
C:\js\learn\unit5\assignments\sprint-01\day-4\U5-PAI-02\DevDiscuss\node_modules\path-to-regexp\dist\index.js:73
            throw new TypeError(`Missing parameter name at ${i}: ${DEBUG_URL}`);
            ^

TypeError: Missing parameter name at 1: https://git.new/pathToRegexpError
    at name (C:\js\learn\unit5\assignments\sprint-01\day-4\U5-PAI-02\DevDiscuss\node_modules\path-to-regexp\dist\index.js:73:19)
    at lexer (C:\js\learn\unit5\assignments\sprint-01\day-4\U5-PAI-02\DevDiscuss\node_modules\path-to-regexp\dist\index.js:91:27)
    at lexer.next (<anonymous>)
    at Iter.peek (C:\js\learn\unit5\assignments\sprint-01\day-4\U5-PAI-02\DevDiscuss\node_modules\path-to-regexp\dist\index.js:106:38)
    at Iter.tryConsume (C:\js\learn\unit5\assignments\sprint-01\day-4\U5-PAI-02\DevDiscuss\node_modules\path-to-regexp\dist\index.js:112:28)        
    at Iter.text (C:\js\learn\unit5\assignments\sprint-01\day-4\U5-PAI-02\DevDiscuss\node_modules\path-to-regexp\dist\index.js:128:30)
    at consume (C:\js\learn\unit5\assignments\sprint-01\day-4\U5-PAI-02\DevDiscuss\node_modules\path-to-regexp\dist\index.js:152:29)
    at parse (C:\js\learn\unit5\assignments\sprint-01\day-4\U5-PAI-02\DevDiscuss\node_modules\path-to-regexp\dist\index.js:183:20)
    at C:\js\learn\unit5\assignments\sprint-01\day-4\U5-PAI-02\DevDiscuss\node_modules\path-to-regexp\dist\index.js:294:74
    at Array.map (<anonymous>)

Node.js v22.17.0
[nodemon] app crashed - waiting for file changes before starting...
