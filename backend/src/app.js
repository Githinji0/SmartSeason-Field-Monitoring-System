import cors from "cors";
import express from "express";
import apiRouter from "./routes/index.js";
import { env } from "./config/env.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

const configuredCorsOrigins = String(env.corsOrigin || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedCorsOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (configuredCorsOrigins.includes(origin)) {
    return true;
  }

  if (env.nodeEnv !== "production") {
    return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
  }

  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedCorsOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json());

app.use(env.apiBasePath, apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
