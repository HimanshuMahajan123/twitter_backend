import { body } from "express-validator";

const registerValidator = () => {
  return [
    body("name")
      .notEmpty()
      .withMessage("Name is reuired.")
      .trim()
      .isLength({ min: 2, max: 20 })
      .withMessage("Name must be between 2 and 20 characters."),

    body("email")
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Please provide a valid email address.")
      .trim(),

    body("username")
      .notEmpty()
      .withMessage("Username is required.")
      .trim()
      .isLength({ min: 3, max: 15 })
      .isLowercase()
      .withMessage(
        "Username must be between 3 and 15 characters and Lowercase",
      ),

    body("password")
      .notEmpty()
      .withMessage("Password is required.")
      .isLength({ min: 8, max: 64 })
      .withMessage("Password must be between 8 and 64 characters."),
  ];
};

const forgotPasswordValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Please provide a valid email address."),
  ];
};

export { registerValidator, forgotPasswordValidator };
