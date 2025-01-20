import {
  createDirectus,
  DirectusClient,
  rest,
  RestClient,
  staticToken,
  StaticTokenClient,
  utilsImport,
} from "@directus/sdk";

export class Directus {
  client: DirectusClient<any> & RestClient<any> & StaticTokenClient<any>;

  constructor(url: string, token: string) {
    this.client = createDirectus(url).with(rest()).with(staticToken(token));
  }

  async importCSV(collection: string, headers: string, values: string) {
    const mockFile = new Blob([headers, values], { type: "text/csv" });

    const formData = new FormData();
    formData.append("file", mockFile);

    return this.client.request(utilsImport(collection, formData));
  }

  async importJSON(
    collection: string,
    data: Record<string, any>[] | Record<string, any>
  ) {
    const mockFile = new Blob([JSON.stringify(([] as any[]).concat(data))], {
      type: "application/json",
    });

    const formData = new FormData();
    formData.append("file", mockFile);

    return this.client.request(utilsImport(collection, formData));
  }
}
