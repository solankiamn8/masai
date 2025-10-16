module.exports = (err, req, res, next) => {
  res.status(400).json({ error: err.message || "Something went wrong" });
};
