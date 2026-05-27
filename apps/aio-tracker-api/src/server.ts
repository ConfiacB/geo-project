// import fs from "fs";
// import https from "https";
import dotenv from "dotenv";
dotenv.config();
import { mongoDB } from "./database";

import app from "./app";
import { PORT } from "./config";

mongoDB.connect();

// if (process.env.NODE_ENV === "production" && process.env.SSL_KEY_FILE && process.env.SSL_CERT_FILE) {
//   const key = fs.readFileSync(process.env.SSL_KEY_FILE);
//   const cert = fs.readFileSync(process.env.SSL_CERT_FILE);
//   const options = { key, cert };
//   https.createServer(options, app).listen(PORT, () => {
//     console.log("HTTPS server running on port:", PORT);
//   });
// } else {
//   app.listen(PORT, () => {
//     console.log("HTTP server running on port:", PORT);
//   });
// }

app.listen(PORT, () => {
  console.log("HTTP server running on port:", PORT);
});
