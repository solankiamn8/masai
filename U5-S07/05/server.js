const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());

const DB_PATH = './db.json';

// Helper: Read students
const readStudents = () => {
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data).students;
};

// Helper: Write students
const writeStudents = (students) => {
  fs.writeFileSync(DB_PATH, JSON.stringify({ students }, null, 2));
};

// POST /students → Add student
app.post('/students', (req, res) => {
  const { name, course, batch } = req.body;
  if (!name || !course || !batch) {
    return res.status(400).json({ error: 'Missing student details' });
  }
  const students = readStudents();
  const id = students.length > 0 ? students[students.length - 1].id + 1 : 1;
  const newStudent = { id, name, course, batch };
  students.push(newStudent);
  writeStudents(students);
  res.status(201).json(newStudent);
});

// GET /students → Fetch all
app.get('/students', (req, res) => {
  const students = readStudents();
  res.status(200).json(students);
});

// GET /students/:id → Fetch by ID
app.get('/students/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const students = readStudents();
  const student = students.find(s => s.id === id);
  if (student) {
    res.status(200).json(student);
  } else {
    res.status(404).json({ message: 'No students found' });
  }
});

// PUT /students/:id → Update student
app.put('/students/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, course, batch } = req.body;
  const students = readStudents();
  const index = students.findIndex(s => s.id === id);
  if (index !== -1) {
    students[index] = { id, name, course, batch };
    writeStudents(students);
    res.status(200).json(students[index]);
  } else {
    res.status(404).json({ message: 'No students found' });
  }
});

// DELETE /students/:id → Delete student
app.delete('/students/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let students = readStudents();
  const student = students.find(s => s.id === id);
  if (student) {
    students = students.filter(s => s.id !== id);
    writeStudents(students);
    res.status(200).json({ message: 'Student deleted successfully' });
  } else {
    res.status(404).json({ message: 'No students found' });
  }
});

// GET /students/search?course= → Filter by course
app.get('/students/search', (req, res) => {
  const courseQuery = req.query.course?.toLowerCase();
  if (!courseQuery) {
    return res.status(400).json({ error: 'Course query parameter is required' });
  }
  const students = readStudents();
  const filtered = students.filter(s =>
    s.course.toLowerCase().includes(courseQuery)
  );
  if (filtered.length > 0) {
    res.status(200).json(filtered);
  } else {
    res.status(404).json({ message: 'No students found' });
  }
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ error: '404 Not Found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
