const Joi = require("joi");

const userSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  name: Joi.string().trim().min(3).max(30).required(),
  password: Joi.string()
    .trim()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and include upper and lower case letters, a number, and a special character.",
    }),
});

const patchUserSchema = Joi.object({
  email: Joi.string().trim().email().not(null),
  name: Joi.string().trim().min(3).max(30).not(null),
  password: Joi.string()
    .trim()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/)
    .not(null),
});

module.exports = { userSchema, patchUserSchema };
