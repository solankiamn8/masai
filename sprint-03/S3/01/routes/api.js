const express = require('express');

const apiRouter = (limiter) => {
  const router = express.Router();

  // Public route (no rate limiting)
  router.get('/public', (req, res) => {
    res.json({ message: "This is a public endpoint!" });
  });

  // Limited route (apply rate limiter)
  router.get('/limited', limiter, (req, res) => {
    res.json({ message: "You have access to this limited endpoint!" });
  });

  return router;
};

module.exports = apiRouter;
