const asyncHandler = (requestHandler) => {
    // This function returns another function that takes `req`, `res`, and `next`
    return (req, res, next) => {
      // Execute the `requestHandler` function (which is asynchronous) and handle its promise
      Promise.resolve(requestHandler(req, res, next)).catch((err) => {
        // If there's an error, pass it to the `next` function (Express's error handler)
        next(err);
      });
    };
  };
  
  export { asyncHandler };
  