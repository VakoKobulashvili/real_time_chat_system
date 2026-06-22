import http from "http";
import app from "./app.js";
import { config } from "./config/index.js";
import { connectDatabase } from "./config/database.js";
import { initSockets } from "./sockets/index.js";

const startServer = async () => {
  await connectDatabase();

  const httpServer = http.createServer(app);
  initSockets(httpServer);

  httpServer.listen(config.port, () => {
    console.log(`Server running on port ${config.port} [${config.env}]`);
  });
};

startServer();
