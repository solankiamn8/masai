SkillSphere Course Enrollment Platform
Problem Statement
Create a Course Enrollment Web Application where admins can create and manage courses, and students can view and enroll in them.

Requirements
Backend (Node.js + Express + MongoDB)
Implement authentication and authorization using JWT.

Create the following models:

User: name, email, password, role (student | admin)
Course: title, description, category, price, createdBy (admin reference)
Enrollment: user (ref User), course (ref Course), enrolledAt (Date)
Implement the following routes:

Auth

POST /register – register a new user
POST /login – login and return JWT token
Courses

POST /courses – create a new course (admin only)
GET /courses – get all courses (with search & pagination)
PUT /courses/:id – edit course (admin only)
DELETE /courses/:id – delete course (admin only)
Enrollments

POST /enroll/:courseId – enroll student in a course
GET /my-courses – get all courses a logged-in student has enrolled in
Use middleware for JWT authentication and role-based access control.

Frontend (React)
Create pages for:

Register / Login
All Courses – show all available courses with search and pagination.
My Courses – display courses the logged-in student has enrolled in.
Add/Edit Course – for admins to manage courses.
Use Axios for API calls and React Router for navigation.

Implement Context API to manage authentication state and share the JWT token across components.

Ensure the JWT token is stored in localStorage so that authentication state persists after page refresh.

Use TailwindCSS or Bootstrap for styling.