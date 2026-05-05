import { app } from "./src/app";

const port = Number(process.env.PORT ?? "3000");
app.listen({
  port,
  hostname: "0.0.0.0",
});
console.log(`API running at http://0.0.0.0:${port}`);
