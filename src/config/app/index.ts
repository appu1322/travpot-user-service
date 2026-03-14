import express from "express";
import { createServer, Server } from "http";
import { router } from "../../routes";
import { morganMiddleware } from "../../middlewares";
import { makeResponse } from "../../lib";
import { HOST, PORT } from "../../constant";

const app = express();

app.use(express.json());
app.use(morganMiddleware);

app.use("/api", router);
app.use((req, res) => makeResponse(req, res, 404, false, 'route_not_found'));

export const initializeApp = () => {
  const server: Server = createServer(app);
  server.listen(PORT, HOST, async () => {
    console.log(`* App is running at PORT: ${PORT} *`);
  });
};
