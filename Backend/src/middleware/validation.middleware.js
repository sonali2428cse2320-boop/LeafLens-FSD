const ApiError = require("../utils/ApiError");

const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      throw new ApiError(400, "Validation failed", errors);
    }

    req[source] = result.data;

    next();
  };
};

module.exports = validate;