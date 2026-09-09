exports.checkHealth = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'CivicConnect API is running smoothly.',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    next(error); // Passes error to our centralized error handler
  }
};