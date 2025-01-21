import {
  createDirectus,
  createItem,
  DirectusClient,
  readFieldsByCollection,
  readRelations,
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

  async relations(collection: string) {
    const allRelations = await this.client.request(readRelations());
    const relations = allRelations.filter(
      (r) =>
        r?.meta?.many_collection === collection ||
        r?.meta?.one_collection === collection
    );

    return relations.reduce((acc, r) => {
      let key = "";

      if (r?.meta?.many_collection === collection) key = r.meta.many_field;
      else if (r?.meta?.one_collection === collection) key = r.meta.one_field;

      if (!key) return acc;

      return { ...acc, [key]: r };
    }, {});
  }

  async createItem(collection: string, data: Record<string, any>) {
    return this.client.request(createItem(collection, data));
  }

  async fields(collection: string) {
    return this.client.request(readFieldsByCollection(collection));
  }

  async primaryKey(collection: string) {
    const fields = await this.fields(collection);
    return fields.find((f) => f.schema.is_primary_key);
  }
}
