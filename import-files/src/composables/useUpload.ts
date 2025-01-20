import { Directus } from "../utils/directus";

export function useUpload(
  url: string,
  sleepTime: number,
  collection: string,
  token: string
) {
  url = url.trim();
  collection = collection.trim();
  token = token.trim();

  const directus = new Directus(url, token);

  return {
    uploadBigCsv,
    uploadJsonFiles,
  };

  async function uploadBigCsv(file: File) {
    const stream = file.stream();
    const decoder = new TextDecoder("utf-8");

    let first = false;
    let headers = "";
    let remainder = "";

    for await (const chunk of stream) {
      let text = remainder + decoder.decode(chunk, { stream: true });

      if (!first) {
        first = true;
        const indexOfBr = text.search(/\r\n|\n/);
        headers = text.substring(0, indexOfBr + 1);
        text = text.substring(indexOfBr + 1);
      }

      const indexOfBr = text.search(/\r\n|\n.*?$/);

      remainder = text.substring(indexOfBr);
      text = text.substring(0, indexOfBr + 1);

      await directus.importCSV(collection, headers, text);

      await sleep(sleepTime);
    }
  }

  async function uploadJsonFiles(files: FileList) {
    for (const rawFile of files) {
      let text = await rawFile.text();
      const json = JSON.parse(text);
      text = "";
      const array = [].concat(json);

      for (const entry of array) {
        await directus.importJSON(collection, entry);

        await sleep(sleepTime);
      }
    }
  }
}

function sleep(timeout = 1000) {
  return new Promise((res) => setTimeout(res, timeout));
}
