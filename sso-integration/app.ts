import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import { directus } from "./services/directus";
import * as auth from "./middlewares/auth";
import { env } from "./env";

export async function createApp() {
  const app = express();

  app.set("view engine", "ejs");
  app.locals.env = env;

  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.get("/", auth.validate, async function (req, res, next) {
    if (req.user) res.redirect("/me");
    else res.render("index");
  });

  app.post("/login", auth.set, async function (req, res, next) {
    res.redirect("/me");
  });

  app.get("/me", auth.validate, async function (req, res, next) {
    if (!req.user) res.redirect("/");
    else res.render("me", { user: req.user });
  });

  app.post("/update-me", auth.validate, async function (req, res, next) {
    await directus.patch("/users/me", req.body);
    res.redirect("/me");
  });

  return { start };

  async function start() {
    app.listen(env.PORT, () => {
      console.log(`Listening on ${env.PORT}`);
    });
  }
}
