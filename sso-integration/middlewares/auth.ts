import Express from "express";
import { directus } from "../services/directus";

export const validate: Express.RequestHandler = async (req, res, next) => {
  directus.defaults.headers.Authorization = `Bearer ${req.cookies.token}`;

  req.user = await directus
    .get("/users/me", {
      params: { fields: ["id", "email", "first_name", "last_name"] },
    })
    .then((r) => r.data.data as Express.Request["user"])
    .catch(() => null);

  next();
};

export const set: Express.RequestHandler = async (req, res, next) => {
  res.cookie("token", req.body.token);

  next();
};
