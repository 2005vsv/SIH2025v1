const notFound = (req, res, next) => {
  const response = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
  };
  
  res.status(404).json(response);
};

module.exports = { notFound };
