import algoliasearch from "algoliasearch";

const client = algoliasearch("client_id", "client_secret");
const index = client.initIndex("directus_index");

export default ({ action }) => {
  action("posts.items.create", async (meta) => {
    await index.saveObjects([{ objectID: `${meta.key}`, ...meta.payload }]);
  });

  action("posts.items.update", async (meta) => {
    await index.partialUpdateObjects(
      meta.keys.map((key) => ({ objectID: `${key}`, ...meta.payload }))
    );
  });

  action("posts.items.delete", async (meta) => {
    await index.deleteObjects(meta.keys);
  });
};
