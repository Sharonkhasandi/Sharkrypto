/**
 * Simple field validator middleware.
 * Usage: validate({ title: "required", email: "required|email" })
 */
export function validate(rules) {
  return (req, res, next) => {
    const errors = {};

    for (const [field, rule] of Object.entries(rules)) {
      const parts = rule.split("|");
      const value = req.body[field];

      for (const part of parts) {
        if (part === "required" && (value === undefined || value === null || value === "")) {
          errors[field] = `${field} is required`;
          break;
        }
        if (part === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[field] = `${field} must be a valid email`;
          break;
        }
        if (part.startsWith("min:")) {
          const min = Number(part.split(":")[1]);
          if (value && String(value).length < min) {
            errors[field] = `${field} must be at least ${min} characters`;
            break;
          }
        }
        if (part.startsWith("max:")) {
          const max = Number(part.split(":")[1]);
          if (value && String(value).length > max) {
            errors[field] = `${field} must be at most ${max} characters`;
            break;
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ errors });
    }
    next();
  };
}
