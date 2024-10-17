import { defineHook } from "@directus/extensions-sdk";
import { InvalidPayloadError } from "@directus/errors";

export default defineHook(({ filter }, { services }) => {
  filter("items.read", async (payload, context, meta) => {
    const versionKey = context?.query?.version;

    if (versionKey) {
      const service = new services.VersionsService({
        schema: meta.schema,
        accountability: meta.accountability,
      });
      1;
      const [version] = await service.readByQuery({
        filter: { key: versionKey },
      });

      if (!version?.id)
        throw new InvalidPayloadError({
          reason: "Version does not exist",
        });
    }

    return payload;
  });
});
