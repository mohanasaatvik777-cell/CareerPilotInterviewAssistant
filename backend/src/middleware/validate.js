const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));
      const firstErrorMessage = formattedErrors[0]?.message || 'Validation failed';
      return res.status(400).json({
        success: false,
        error: firstErrorMessage,
        details: formattedErrors
      });
    }
    next(error);
  }
};

module.exports = validate;
