import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";
import fs from "fs";

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];

  errors.array().map((err) => {
    const { path, msg } = err;
    extractedErrors.push({ [path]: msg });
  });

  if (extractedErrors.length > 0) {
    if (req.file) {
      const localFilePath = req.file.path;
      fs.unlinkSync(localFilePath);
    }
    console.error("Validation Errors : ", extractedErrors);
    throw new ApiError(422, "Validation Error");
  }
};

export { validate };
