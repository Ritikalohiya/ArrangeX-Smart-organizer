
// ==========================================
// NOT FOUND MIDDLEWARE
// ==========================================
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
export const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err.stack || err.message);

  let statusCode = res.statusCode;

  if (!statusCode || statusCode === 200) {
    statusCode = 500;
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
