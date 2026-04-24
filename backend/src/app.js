import cors from "cors";
import express from "express";
import apiRouter from "./routes/index.js";
import { env } from "./config/env.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: env.corsOrigin
  })
);
app.use(express.json());

app.use(env.apiBasePath, apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
