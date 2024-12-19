class ApiResponse {
    constructor(statusCode, data, message = "Success") {
      this.statusCode = statusCode;  // The HTTP status code (e.g., 200, 400, 500)
      this.data = data;              // The data you want to send in the response (e.g., user info, list of items)
      this.message = message;        // A message describing the response (default is "Success")
      this.success = statusCode < 400; // Success is true if the statusCode is less than 400 (i.e., a successful response)
    }
  }
  