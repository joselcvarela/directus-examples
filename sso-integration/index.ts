import { createApp } from "./app";

async function start() {
  const app = await createApp();

  await app.start();
}

start();
