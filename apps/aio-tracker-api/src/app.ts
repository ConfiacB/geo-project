import express, { Request, Response } from "express";
// import bodyParser from "body-parser";
import cors from "cors";

import { analyze } from "./routes";
import { errorHandler, handle404, requestLogger } from "./middlewares";

const app = express();

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ ok: true, service: "ai-overview-tracker" });
});
app.use("/analyze", analyze);

app.use("*", handle404);

app.use(errorHandler);
app.use(requestLogger);

export default app;
