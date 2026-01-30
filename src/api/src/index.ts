import express from "express";

import usersRouter from "./routes/users.js";

const app = express();
const port = 3000;

app.use(express.json({ limit: "100mb" }));

app.use("/users", usersRouter);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
