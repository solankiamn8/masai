// Middleware to validate task data for POST and PATCH
const validateTask = (req, res, next) => {
    const { title, description, priority } = req.body;
  
    if (!title || !description || !priority) {
      return res.status(400).json({ error: 'Incomplete Data Received' });
    }
  
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority. Use low, medium, or high' });
    }
  
    next();
  };
  
  module.exports = { validateTask };
  