import dotenv from "dotenv";
import { app } from "./app.js";
dotenv.config({ path: "./.env" });

import connectDB from "./db/index.js";
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server Connected at Port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB FAILED !!!", err);
  });
