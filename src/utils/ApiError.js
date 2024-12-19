class ApiError extends Error {
  constructor(
    statusCode,                        // The error's HTTP status code (e.g., 404 for "Not Found")
    message = "Something Went Wrong",  // The error message (default is "Something Went Wrong")
    errors = [],                       // Extra details about the error (default is an empty array)
    stack = ""                         // Information about where the error happened (helps with debugging)
  ) {
    super(message);                    // Call the original `Error` class with the message
    this.statusCode = statusCode;      // Save the HTTP status code (e.g., 400, 500)
    this.data = null;                  // You can use this to add extra data if needed (currently set to `null`)
    this.message = message;            // Save the error message
    this.success = false;              // Indicate the operation failed (always `false` for errors)
    this.errors = errors;              // Save any extra error details (e.g., validation errors)

    // If a stack trace is provided, use it. If not, generate one automatically.
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };  // Export the class so you can use it in other files
