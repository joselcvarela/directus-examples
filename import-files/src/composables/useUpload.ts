export function useUpload(url: string, collection: string, token: string) {
  url = url.trim();
  collection = collection.trim();
  token = token.trim();

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

      const mockFile = new Blob([headers, text], { type: "text/csv" });

      const formData = new FormData();
      formData.append("file", mockFile);

      await fetch(new URL(`/utils/import/${collection.trim()}`, url.trim()), {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token.trim()}`,
        },
      });

      await sleep();
    }
  }

  async function uploadJsonFiles(files: FileList) {
    for (const rawFile of files) {
      const json = JSON.parse(await rawFile.text());
      const array = [].concat(json);

      const mockFile = new Blob([JSON.stringify(array)], {
        type: "application/json",
      });

      const formData = new FormData();
      formData.append("file", mockFile);

      await fetch(new URL(`/utils/import/${collection.trim()}`, url.trim()), {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token.trim()}`,
        },
      });

      await sleep();
    }
  }
}

function sleep(timeout = 1000) {
  return new Promise((res) => setTimeout(res, timeout));
}
