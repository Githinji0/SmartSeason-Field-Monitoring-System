import app from "./app.js";
import { env } from "./config/env.js";
import { checkDatabaseConnection, ensureUserFarmAssignmentColumn } from "./config/db.js";

async function bootstrap() {
  try {
    await checkDatabaseConnection();
    await ensureUserFarmAssignmentColumn();
    app.listen(env.port, () => {
      console.log(`API running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

bootstrap();
