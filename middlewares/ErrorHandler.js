module.exports = (err, req, res, next) => {
  console.error(err); // Log the error for debugging

  // Extract status and message, set default values for unexpected errors
  const { statusCode = 500, message = "An error occurred on the server" } = err;

  res.status(statusCode).send({
    message: statusCode === 500 ? "An error occurred on the server" : message,
  });
  next();
};
