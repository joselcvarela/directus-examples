import axios from "axios";
import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import FormData from "form-data";

async function start() {
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const config = await import("../config.js").then((m) => m.default);

  const filename = "directus.jpeg";

  const form = new FormData();

  form.append("title", "Title of asset");
  form.append(
    "file",
    fs.createReadStream(path.join(__dirname, "..", filename)),
    filename
  );

  const filesEndpoint = new URL("/files", config.DIRECTUS_URL);

  await axios.post(filesEndpoint.toString(), form);
}

start();
