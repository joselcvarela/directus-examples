import { defineHook } from "@directus/extensions-sdk";

export default defineHook(({ init }, context) => {
  const { services, getSchema } = context;
  const { UsersService } = services;

  init("middlewares.after", (app) => {
    app.use(async (req, res, next) => {
      const schema = req.schema || (await getSchema());
      const usersService = new UsersService({ schema });

      const user = usersService.readOne(req.accountability?.id);

      if (user && user.token && req.token === user.token)
        return res.send(401).end();

      return next();
    });
  });
});
