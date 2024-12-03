import { defineHook } from "@directus/extensions-sdk";

export default defineHook(({ init }) => {
  init("middlewares.after", (app) => {
    app.use(async (req, res, next) => {
      if (!req.token) next();

      const decoded = Buffer.from(req.token, "base64").toString("utf-8");
      if (!decoded || !decoded.includes("HS256") || !decoded.includes("JWT")) {
        // Is not a JWT string so it's a static token
        return res.send(401).end();
      }

      return next();
    });
  });
});
